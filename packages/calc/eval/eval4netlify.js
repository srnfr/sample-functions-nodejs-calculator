const expeval = require("expression-eval");
const { createClient } = require("redis");
const key = "counter";

exports.handler = async function main(event, context, callback) {
  const redis = createClient({url: process.env.DATABASE_URL})
  //const redis = createClient({url: args.DATABASE_URL_PARAM})
  //console.log("Redis : ", process.env.DATABASE_URL);

  return redis
    .connect()
    .then(() => {
      // Start timing now
      console.time("concatenation");
      //
      const expr = event.queryStringParameters.text;
      console.log("expr : ", expr);
      const result = evaluate(expr);
      console.log("result : ", result);
      return redis
        .get(key)
        .then((reply) => {
          console.log("returning response...");
          return updateAndReply(redis, asCount(reply), result);
          console.log("au retour de updateandreply...");
          // ... and stop.
          console.timeEnd("concatenation");
        })
        .catch((err) => {
          return updateAndReply(redis, 0, result);
        });
        
    })
    .catch((err) => {
      console.log("ERROR : ", err);
      return err;
    })
    .finally(() => {
      redis.disconnect();
    });
}

function evaluate(exprStr) {
  try {
    let ast = expeval.parse(exprStr);
    return expeval.eval(ast);
  } catch {
    return "error evaluating expression";
  }
}
function asCount(s) {
  if (Number.isInteger(s)) {
    return s;
  }
  let v = parseInt(s, 10);
  return isNaN(v) ? 0 : v;
}

function updateAndReply(redis, count, text) {
  return redis
    .set(key, count + 1)
    .then(() => {
      console.log("inside updateandreply...");
      return { 
        statusCode: 200,
        body: JSON.stringify({ count: count, result: text }),
        headers : { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
         }    
      }
    }
    )
    .catch((err) => {
      return { count: count, result: text };
    })
}
