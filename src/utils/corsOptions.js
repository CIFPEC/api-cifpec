export default function corsOptions(){
  const whiteList = process.env.WHITE_LIST.split(",");
  const corsOption = {
    origin: function (origin, callback) {
      if (whiteList.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allow by CORS'));
      }
    }
  }
  return corsOption;
}