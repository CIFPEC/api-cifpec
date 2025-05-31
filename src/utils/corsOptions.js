
export default function corsOptions(){
  const whiteList = process.env.WHITE_LIST.split(",");
  const corsOption = {
    origin: function (origin, callback) {
      if (whiteList.includes("*") || whiteList.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allow by CORS'));
      }
    },
    methods:["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization","Verify-Token","Reset-Token"],
    credentials: true,
  }
  return corsOption;
}