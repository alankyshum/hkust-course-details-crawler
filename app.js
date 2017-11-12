const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const beautify = require("json-beautify");
const express = require('express');

startServer();
// saveCourseDetails();

function startServer() {
  const app = express();

  app.get('/course-details', (req, res) => {
    const detailsFile = fs.readFileSync('./data/courseDetails.json');
    res.send(JSON.parse(detailsFile));
  });

  app.use(express.static('public'));

  app.listen(3030);
  console.log('opened port at 3030');
}

function saveCourseDetails() {
  const COURSE_INPUT = readCouresList();
  const courseDetailsPromiseArray = COURSE_INPUT.courseList.map(getCourseDetails);

  Promise.all(courseDetailsPromiseArray)
    .then(allCourseDetails => {
      console.info(`[APP] Done. ${allCourseDetails.length} records are crawled and saved`);
      saveJSONtoFile(allCourseDetails, './data/courseDetails.json');
    });
}

function readCouresList() {
  const courseList = fs.readFileSync('./data/courseList.json', 'utf8');
  return JSON.parse(courseList);
}

function getCourseDetails(courseCode) {
  return new Promise((resolve, reject) => {
    request(`http://prog-crs.ust.hk/ugcourse/2017-18/search?keyword=${courseCode}`, function (error, response, html) {
      if (error) return reject(error);

      const $ = cheerio.load(html);
      const courseDetail = { code: courseCode, title: null, credit: null, description: null };
      $('div.container.container-content div.crse-title').each(function(i, element){
        courseDetail.title = $(this).text();
      });
      $('div.container.container-content div.crse-unit').each(function(i, element){
        courseDetail.credit = $(this).text();
      });
      $('div.container.container-content div.data-row.data-row-long div.data').each(function(i, element){
        courseDetail.description = $(this).text();
      });

      console.info(`[CRAWLER] crawled ${courseCode}`);
      resolve(courseDetail);
    });
  })
}

function saveJSONtoFile(json, filePath) {
  return new Promise((resolve, reject) => {
    const stringData = beautify(json, null, 2, 120);
    fs.writeFile(filePath, stringData, function (err,data) {
      if (err) return reject(err);
      resolve(data);
    });
  })
}
