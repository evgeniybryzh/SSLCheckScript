const express = require("express");
const tls = require("tls");
const app = express();
const fs = require("fs");
console.log(
  "========================== SSL CHECK HAS STARTED ============================="
);
const findDaysBetweenDates = (data) => {
  let validTo = data;
  validTo = new Date(validTo);
  let date = new Date();
  const daysLag = Math.ceil(
    Math.abs(date.getTime() - validTo.getTime()) / (1000 * 3600 * 24)
  );
  return daysLag;
};

const filterDomains = (domain, countNumber) => {
  const socket = tls.connect(
    {
      host: domain[0],
      port: 443,
      servername: domain[0],
    },
    () => {
      const peerCertificate = socket.getPeerCertificate();

      console.log(
        `${domain[0]}, days left : ${findDaysBetweenDates(
          peerCertificate.valid_to
        )} `
      );
      socket.destroy();
    }
  );

  socket.on("error", (err) => {
    if (err.code === "CERT_HAS_EXPIRED") {
      console.log(`${domain[0]}, days left : 0`);
    } else console.log(`${domain[0]},  ${err.code}`);
  });
  socket.on("close", () => {});
};

const checkDomainsArrForSSL = (domainsArr) => {
  domainsArr.forEach((item, idx) => {
    filterDomains(item, idx);
    if (idx === domainsArr.length - 1) {
      process.on("exit", function (code) {
        return console.log(
          `======================== SCRIPT FINISHED WITH CODE : ${code} =======================`
        );
      });
    }
  });
};

fs.readFile("domains.txt", function (err, data) {
  if (err) {
    console.error(err);
  } else {
    const domainsData = data.toString();
    const newData = domainsData.replace(/\r?\n?\t/g, " ");
    const newDataArr = newData.split("\n");
    const finalArr = newDataArr.map((item) => {
      return item.split(" ");
    });

    checkDomainsArrForSSL(finalArr);
  }
});
