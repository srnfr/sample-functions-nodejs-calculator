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
      const expr = event.queryStringParameters.text;
      console.log("expr : ", expr);
      const result = evaluate(expr);
      console.log("result : ", result);
      return redis
        .get(key)
        .then((reply) => {
          updateAndReply(redis, asCount(reply), result);
          const body = { count: count, result: text };
          const response = {
             statusCode: 200,
             body: body,
             headers: {
               'content-type': 'application/json',
               'cache-control': 'Cache-Control: max-age=60, public'
             },
           };
          console.log("return response...");
          return response;
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
        return { count: count, result: text };    
    })
    .catch((err) => {
      return { count: count, result: text };
    });
}
