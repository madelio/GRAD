"use strict";

var emptyReq = {
    type: "",
    courses: [],
    courses_needed: 0,
    credits_needed: null
};

var getElectives = function(cheerio, electiveElement) {
    return [];
}

var databaseCallback = function(callback, request, cheerio, cseUDCourses) {
    var majors = [];
    var url = "http://ucsd.edu/catalog/curric/CSE-ug.html";


    // variable meanings
    var paragraphs = 3;
    var courseCountFirstReq = 9

    request(url, function(error, response, html) {
        var $ = cheerio.load(html);

        var requirements = [];
        //have to get technical electives
        var technicalElectives = getElectives(cheerio, $(".program-overview-subhead-2")[4]);

        var major = ["CSE", "26", "Computer Science", "", {}];

        var csheader = $(".program-overview-subhead-2").first();

        //Grabs Program Header
        var p = csheader.next();

        // Grabs Program description
        var text = p.text();

        // skips 2 paragraphs to get to lower div requrements
        for(var i=0;i<2;i++) {
            p = p.next();
            text += "\n\n" + p.text();
        }
        major[3] = text;    //set description

        // skips lower div title & defn & goes to the list of requirements
        var ol = p.next().next().next();

        //lower div requirements
        var olchildren = ol.children();

        //REQ 1
        var req1 = olchildren.first();

        // takes the whole requirements text
        var req1text = req1.text();

        // parses the requirements
        var req1s = req1text;
        var currCourse = [];

        // changes emptyReq to a json string object & parses it - to make a deep copy and not assign by reference
        var currReq = JSON.parse(JSON.stringify(emptyReq));
        //9 courses in this req
        for(var i=0;i<9;i++){
            var or = false;
            var course = req1s.match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/)[0];
            if(req1s.indexOf("or")==1) {
                or = true;
                currReq.courses.push(course);
                requirements.push(currReq);
                currReq = JSON.parse(JSON.stringify(emptyReq));
            }
            req1s = req1text.split(course)[1];
            if(!or) {
                if(req1s.indexOf("or")==1) {
                    if(currReq.courses_needed > 0) requirements.push(currReq);
                    currReq = JSON.parse(JSON.stringify(emptyReq));
                    currReq.courses.push(course);
                    currReq.courses_needed = 1;
                } else {
                    currReq.courses.push(course);
                    currReq.courses_needed += 1;
                }
            }
        }
        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));


        //REQ 2
        var req2 = req1.next();
        currReq.courses = req2.text().match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/g);
        currReq.courses_needed = 1;
        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));


        //REQ 3
        var req3 = req2.next();
        currReq.courses = req3.text().match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/g);
        currReq.courses_needed = currReq.courses.length;
        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));

        //REQ 4
        var req4 = req3.next();
        currReq.courses = req4.text().match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/g);
        currReq.courses_needed = 2;
        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));

        //REQ 5
        var req5 = req4.next();
        currReq.courses = req5.text().match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/g);
        currReq.courses_needed = 1;
        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));


        //UPPER DIV

        ol = ol.next().next().next();
        olchildren = ol.children();

        req1 = olchildren.first();
        var req1text = req1.text();

        var req1s = req1text;
        for(var i = 0; i < 8; i++) {
            var or = false;
            var course = req1s.match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/)[0];
            if(req1s.indexOf("or")==1 && i > 0) {   //the word core also has or at index 1
                or = true;
                currReq.courses.push(course);
                requirements.push(currReq);
                currReq = JSON.parse(JSON.stringify(emptyReq));
            }
            req1s = req1text.split(course)[1];
            if(!or) {
                if(req1s.indexOf("or")==1) {
                    if(currReq.courses_needed > 0) requirements.push(currReq);
                    currReq = JSON.parse(JSON.stringify(emptyReq));
                    currReq.courses.push(course);
                    currReq.courses_needed = 1;
                } else {
                    currReq.courses.push(course);
                    currReq.courses_needed += 1;
                }
            }
        }

        //two for loops because the cse department hates me
        //(they don't put department name in front of course number)
        for(var i = 0; i < 6; i++) {
            var course = req1s.match(/[0-9][0-9A-Z]*/)[0];
            currReq.courses.push("CSE " + course);
            currReq.courses_needed += 1;
            req1s = req1text.substring(req1text.indexOf(course) + course.length);
        }
        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));

        //ELECTIVES
        currReq.type = "Electives";
        currReq.courses = cseUDCourses;
        currReq.courses_needed = 7;

        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));

        var TEs = cseUDCourses.concat(technicalElectives);
        currReq.type = "Technical Electives";
        currReq.courses = TEs;
        currReq.courses_needed = 2;

        requirements.push(currReq);

        console.log("requirements: ");
        for(var req of requirements) {
            console.log(req);
        }
        console.log("done requirements.");

        major[4] = requirements;
        majors.push(major);



        //Computer Engineering
        requirements = [];
        major = ["CSE", "25", "Computer Engineering", "", {}];

        csheader = $(".program-overview-subhead-2").eq(1);
        //console.log(csheader.text());

        //Grabs Program Header
        p = csheader.next();

        // Grabs Program description
        text = p.text();

        // grabs next three paragraphs
        for(i=0; i < paragraphs; i++) {
            p = p.next();
            text += "\n\n" + p.text();
        }

        major[3] = text;    //set description

        // skips lower div title & defn & goes to the list of requirements
        ol = p.next().next().next();

        //lower div requirements
        olchildren = ol.children();

        //REQ 1
        req1 = olchildren.first();

        // takes the whole requirements text
        req1text = req1.text();
        //console.log(req1text);

        // parses the requirements
        req1s = req1text;
        currCourse = [];

        // changes emptyReq to a json string object & parses it
        currReq = JSON.parse(JSON.stringify(emptyReq));
        //9 courses in this req
        for(var i=0;i< courseCountFirstReq;i++){
            or = false;
            course = req1s.match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/)[0];

            if(req1s.indexOf("or")==1) {
                or = true;
                currReq.courses.push(course);
                requirements.push(currReq);
                currReq = JSON.parse(JSON.stringify(emptyReq));
            }
            req1s = req1text.split(course)[1];
            if(!or) {
                if(req1s.indexOf("or")==1) {
                    if(currReq.courses_needed > 0) requirements.push(currReq);
                    currReq = JSON.parse(JSON.stringify(emptyReq));
                    currReq.courses.push(course);
                    currReq.courses_needed = 1;
                } else {
                    currReq.courses.push(course);
                    currReq.courses_needed += 1;
                }
            }
        }
        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));

        //lower div req2
        req2 = req1.next();
        currReq.courses = req2.text().match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/g);
        currReq.courses_needed = 1;
        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));


        //lower div req 3
        req3 = req2.next();
        currReq.courses = req3.text().match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/g);
        currReq.courses_needed = currReq.courses.length;
        requirements.push(currReq);

        //lower div req 4
        currReq = JSON.parse(JSON.stringify(emptyReq));
        req4 = req3.next();
        currReq.courses = req4.text().match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/g);
        // grabs only first 3 requirements since those are the only ones that matter
        currReq.courses = currReq.courses.slice(0,3)
        currReq.courses_needed = currReq.courses.length;
        requirements.push(currReq);

        // lower div req 5
        currReq = JSON.parse(JSON.stringify(emptyReq));
        req5 = req4.next();
        currReq.courses = req5.text().match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/g);
        console.log(currReq.courses);
        currReq.courses_needed = currReq.courses.length;
        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));


        //UPPER DIV

        ol = ol.next().next().next();
        olchildren = ol.children();

        req1 = olchildren.first();
        req1text = req1.text();
        console.log(req1text)

        req1s = req1text;
        // since only first 6 w/ course names in front of it
        for(var i = 0; i < 6; i++) {
            or = false;
            course = req1s.match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/)[0];
            if(req1s.indexOf("or")==1 && i > 0) {   //the word core also has or at index 1
                or = true;
                currReq.courses.push(course);
                requirements.push(currReq);
                currReq = JSON.parse(JSON.stringify(emptyReq));
            }
            req1s = req1text.split(course)[1];
            if(!or) {
                if(req1s.indexOf("or")==1) {
                    if(currReq.courses_needed > 0) requirements.push(currReq);
                    currReq = JSON.parse(JSON.stringify(emptyReq));
                    currReq.courses.push(course);
                    currReq.courses_needed = 1;
                } else {
                    currReq.courses.push(course);
                    currReq.courses_needed += 1;
                }
            }
        }

        //two for loops because the cse department hates me
        //(they don't put department name in front of course number)
        for(var i = 0; i < 4; i++) {
            course = req1s.match(/[0-9][0-9A-Z]*/)[0];
            currReq.courses.push("CSE " + course);
            currReq.courses_needed += 1;
            req1s = req1text.substring(req1text.indexOf(course) + course.length);
        }
        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));

        req2 = req1.next();
        currReq.courses = req2.text().match(/[A-Za-z]{2,4}\s[0-9][0-9A-Z]*/g);
        currReq.courses_needed = currReq.courses.length;
        console.log(currReq);
        requirements.push(currReq);

        //ELECTIVES
        currReq = JSON.parse(JSON.stringify(emptyReq));
        currReq.type = "Electives";
        currReq.courses = cseUDCourses;
        currReq.courses_needed = 7;

        requirements.push(currReq);
        currReq = JSON.parse(JSON.stringify(emptyReq));

        var TEs = cseUDCourses.concat(technicalElectives);
        currReq.type = "Technical Electives";
        currReq.courses = TEs;
        currReq.courses_needed = 2;

        requirements.push(currReq);


        console.log("requirements for CE: ");
        for(var req of requirements) {
        console.log(req);
        }
        console.log("done requirements. CE");

        major[4] = requirements;
        majors.push(major);

        callback(majors);
    });
}

exports.getMajors = function(callback, request, cheerio, database_accessor) {
    database_accessor.getAllClassesInDepartment("CSE", function(courses) {
        var courseList = [];
        for(var course of courses) {
            var courseNumber = course.number.match(/[0-9]*/);
            var courseNumberInt = parseInt(courseNumber[0]);
            if(courseNumberInt >= 100 && courseNumberInt < 200) courseList.push(course.department + " " + course.number);
        }
        databaseCallback(callback, request, cheerio, courseList);
    })
};