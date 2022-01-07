import dotenv from 'dotenv';
import  DAILY_REPORT from "./daily_report.js";

dotenv.config();
const daily_report = new DAILY_REPORT()


daily_report.build()
    .then(console.log)
    .catch(console.log)