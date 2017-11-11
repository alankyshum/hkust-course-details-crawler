const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const COURSE_INPUT = readCouresList();
const courseDetailsPromiseArray = COURSE_INPUT.courseList.map(getCourseDetails);

Promise.all(courseDetailsPromiseArray)
  .then(allCourseDetails => {
    console.log(allCourseDetails);
  })

function readCouresList() {
  const courseList = fs.readFileSync('./data/courseList.json', 'utf8');
  return JSON.parse(courseList);
}

function getCourseDetails(courseCode) {
  return new Promise((resolve, reject) => {
    request(`http://prog-crs.ust.hk/ugcourse/2017-18/search?keyword=${courseCode}`, function (error, response, html) {
      if (error) return reject(error);

      const $ = cheerio.load(html);
      const courseDetail = { title: null, credit: null, description: null };
      $('div.container.container-content div.crse-title').each(function(i, element){
        courseDetail.title = $(this).text();
      });
      $('div.container.container-content div.crse-unit').each(function(i, element){
        courseDetail.credit = $(this).text();
      });
      $('div.container.container-content div.data-row.data-row-long div.data').each(function(i, element){
        courseDetail.description = $(this).text();
      });

      resolve(courseDetail);
    });
  })
}
