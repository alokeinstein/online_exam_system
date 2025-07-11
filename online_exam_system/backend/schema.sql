-- -- schema.sql
-- -- This script sets up the database tables for the Online Exam System.

-- -- Drop tables if they exist to ensure a clean slate
-- DROP TABLE IF EXISTS exam_results;
-- DROP TABLE IF EXISTS answers;
-- DROP TABLE IF EXISTS questions;
-- DROP TABLE IF EXISTS courses;
-- DROP TABLE IF EXISTS candidates;

-- -- 1. Candidates Table
-- -- Stores information about the exam takers.
-- CREATE TABLE candidates (
--     id SERIAL PRIMARY KEY,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     name VARCHAR(255),
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 2. Courses Table
-- -- Stores the different courses or subjects for the exams.
-- CREATE TABLE courses (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL
-- );

-- -- 3. Questions Table
-- -- Stores the exam questions, linked to a course.
-- -- options are stored as a JSONB array of strings.
-- -- correct_option is the 0-based index of the correct answer in the options array.
-- CREATE TABLE questions (
--     id SERIAL PRIMARY KEY,
--     course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
--     question_text TEXT NOT NULL,
--     options JSONB NOT NULL, -- e.g., '["Option A", "Option B", "Option C", "Option D"]'
--     correct_option INTEGER NOT NULL -- e.g., 0 for "Option A"
-- );

-- -- 4. Answers Table
-- -- Stores the answers selected by a candidate for each question.
-- -- A composite primary key on (candidate_id, question_id) ensures one answer per question per candidate.
-- CREATE TABLE answers (
--     id SERIAL PRIMARY KEY,
--     candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
--     question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
--     selected_option INTEGER NOT NULL,
--     is_correct BOOLEAN NOT NULL,
--     answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE (candidate_id, question_id)
-- );

-- -- 5. Exam Results Table
-- -- Stores the final score for a candidate's exam attempt.
-- CREATE TABLE exam_results (
--     id SERIAL PRIMARY KEY,
--     candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
--     course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
--     score INTEGER NOT NULL,
--     attempted_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Add indexes for better query performance
-- CREATE INDEX ON questions (course_id);
-- CREATE INDEX ON answers (candidate_id, question_id);
-- CREATE INDEX ON exam_results (candidate_id, course_id);


-- --- SAMPLE DATA ---

-- -- Insert a sample candidate
-- INSERT INTO candidates (email, name) VALUES ('test.candidate@example.com', 'Test Candidate');

-- -- Insert sample courses
-- INSERT INTO courses (id, name) VALUES (1, 'JavaScript Fundamentals');
-- INSERT INTO courses (id, name) VALUES (2, 'React Basics');

-- -- Insert sample questions for JavaScript Fundamentals (Course ID 1)
-- -- Generating 50 questions for variety
-- INSERT INTO questions (course_id, question_text, options, correct_option) VALUES
-- (1, 'What does the `typeof` operator return for `null`?', '["null", "undefined", "object", "string"]', 2),
-- (1, 'Which company developed JavaScript?', '["Microsoft", "Apple", "Netscape", "Sun Microsystems"]', 2),
-- (1, 'How do you declare a constant variable in JavaScript?', '["var", "let", "const", "static"]', 2),
-- (1, 'What is the result of `2 + "2"`?', '["4", "22", "Error", "NaN"]', 1),
-- (1, 'Which method is used to parse a JSON string?', '["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.toObject()"]', 0),
-- (1, 'What does `===` operator check?', '["Value only", "Type only", "Value and type", "None of the above"]', 2),
-- (1, 'How do you write a single line comment in JS?', '["// comment", "/* comment */", "<!-- comment -->", "# comment"]', 0),
-- (1, 'Which function is used to print content to the console?', '["print()", "log()", "console.log()", "display()"]', 2),
-- (1, 'What is the correct way to write a JavaScript array?', '["var colors = (1,2,3)", "var colors = [1,2,3]", "var colors = {1,2,3}", "var colors = <1,2,3>"]', 1),
-- (1, 'What does `NaN` stand for?', '["Not a Number", "No and No", "New and Null", "Not a Name"]', 0),
-- (1, 'Which event occurs when the user clicks on an HTML element?', '["onmouseclick", "onchange", "onmouseover", "onclick"]', 3),
-- (1, 'How do you find the number with the highest value of x and y?', '["Math.ceil(x, y)", "Math.max(x, y)", "top(x, y)", "Math.high(x, y)"]', 1),
-- (1, 'What is the purpose of the `this` keyword?', '["It refers to the current function", "It refers to the previous object", "It refers to the global object", "It refers to the object from which a function was called"]', 3),
-- (1, 'Which of the following is not a reserved word in JavaScript?', '["interface", "throws", "program", "short"]', 2),
-- (1, 'How do you create a function in JavaScript?', '["function = myFunction()", "function:myFunction()", "function myFunction()", "create function myFunction()"]', 2),
-- (1, 'How do you call a function named "myFunction"?', '["call function myFunction()", "call myFunction()", "myFunction()", "execute myFunction()"]', 2),
-- (1, 'How to write an IF statement in JavaScript?', '["if i = 5 then", "if i == 5", "if (i == 5)", "if i = 5"]', 2),
-- (1, 'How does a WHILE loop start?', '["while (i <= 10; i++)", "while i = 1 to 10", "while (i <= 10)", "while i <= 10"]', 2),
-- (1, 'How does a FOR loop start?', '["for (i = 0; i <= 5)", "for i = 1 to 5", "for (i <= 5; i++)", "for (i = 0; i <= 5; i++)"]', 3),
-- (1, 'What is the correct way to include an external script called `xxx.js`?', '["<script href=`xxx.js`>", "<script name=`xxx.js`>", "<script src=`xxx.js`>", "<include script=`xxx.js`>"]', 2),
-- (1, 'JavaScript is the same as Java.', '["True", "False"]', 1),
-- (1, 'Which operator is used to assign a value to a variable?', '["*", "-", "=", "x"]', 2),
-- (1, 'What will the following code return: `Boolean(10 > 9)`?', '["false", "true", "NaN", "undefined"]', 1),
-- (1, 'Is JavaScript case-sensitive?', '["Yes", "No"]', 0),
-- (1, 'The external JavaScript file must contain the `<script>` tag.', '["True", "False"]', 1),
-- (1, 'How do you round the number 7.25, to the nearest integer?', '["round(7.25)", "Math.rnd(7.25)", "Math.round(7.25)", "rnd(7.25)"]', 2),
-- (1, 'How do you declare a JavaScript variable?', '["v carName;", "variable carName;", "var carName;"]', 2),
-- (1, 'Which method can be used to return a string in upper case letters?', '["toUpperCase()", "upperCase()", "toUpper()", "convertToUpper()"]', 0),
-- (1, 'Which of the following is a primitive type?', '["Array", "Object", "String", "Function"]', 2),
-- (1, 'What is a closure in JavaScript?', '["A function having access to the parent scope, even after the parent function has closed.", "A way to lock variables.", "A type of loop.", "A built-in object."]', 0),
-- (1, 'What is the output of `typeof []`?', '["array", "object", "list", "undefined"]', 1),
-- (1, 'How do you add an element to the end of an array?', '["arr.add()", "arr.push()", "arr.append()", "arr.last()"]', 1),
-- (1, 'How do you remove the last element from an array?', '["arr.removeLast()", "arr.slice(-1)", "arr.pop()", "arr.cut()"]', 2),
-- (1, 'What does `Array.prototype.map()` do?', '["Modifies the original array", "Creates a new array with the results of calling a provided function on every element", "Filters the array", "Returns the first element that satisfies a condition"]', 1),
-- (1, 'What is the purpose of `bind()`?', '["To execute a function immediately", "To create a new function that, when called, has its `this` keyword set to the provided value", "To attach an event listener", "To connect two objects"]', 1),
-- (1, 'What is event bubbling?', '["An event propagates from the target element up to the root", "An event is captured from the root down to the target", "An event that happens randomly", "A type of custom event"]', 0),
-- (1, 'How can you stop event propagation?', '["event.stop()", "event.halt()", "event.stopPropagation()", "event.preventDefault()"]', 2),
-- (1, 'What is `localStorage` used for?', '["Storing data for the duration of a session", "Storing data with no expiration time", "Server-side storage", "Temporary storage for functions"]', 1),
-- (1, 'What is the difference between `let` and `var`?', '["`let` is function-scoped, `var` is block-scoped", "`let` is block-scoped, `var` is function-scoped", "There is no difference", "`let` is for constants"]', 1),
-- (1, 'What is a Promise?', '["A proxy for a value not necessarily known when the promise is created", "A callback function", "A type of variable", "A synchronous operation"]', 0),
-- (1, 'Which method is used to handle a successful promise?', '[".then()", ".catch()", ".finally()", ".all()"]', 0),
-- (1, 'Which method is used to handle a failed promise?', '[".then()", ".catch()", ".finally()", ".error()"]', 1),
-- (1, 'What is `async/await`?', '["A way to write asynchronous code that looks synchronous", "A new type of loop", "A method for array manipulation", "A way to declare variables"]', 0),
-- (1, 'How do you define an arrow function?', '["const f = -> {}", "const f = => {}", "const f = () => {}", "function f => {}"]', 2),
-- (1, 'What are template literals?', '["Strings allowing embedded expressions, using back-ticks (` `)", "A way to define HTML templates", "A special type of comment", "A function for creating templates"]', 0),
-- (1, 'How do you get the length of a string `str`?', '["str.size", "str.length", "length(str)", "str.count"]', 1),
-- (1, 'Which of these is a valid method to get an element by its ID?', '["document.getElementById()", "document.getElement(id)", "document.queryId()", "document.selectById()"]', 0),
-- (1, 'What is the result of `!!"Hello"`?', '["true", "false", "Error", "undefined"]', 0),
-- (1, 'What does the `...` spread operator do in an array literal?', '["It compresses an array", "It expands an iterable into individual elements", "It creates a copy of the first element", "It reverses the array"]', 1);


-- -- Insert sample questions for React Basics (Course ID 2)
-- INSERT INTO questions (course_id, question_text, options, correct_option) VALUES
-- (2, 'What is React?', '["A JavaScript library for building user interfaces", "A server-side framework", "A database", "A programming language"]', 0),
-- (2, 'What is JSX?', '["A syntax extension for JavaScript", "A templating engine", "A CSS preprocessor", "A database query language"]', 0),
-- (2, 'How do you create a React component?', '["Using a function or a class", "Only using classes", "Only using functions", "Using a constructor"]', 0),
-- (2, 'What is the virtual DOM?', '["A direct representation of the DOM", "A copy of the DOM kept in memory", "A tool for debugging", "A browser feature"]', 1),
-- (2, 'How do you pass data to a component from its parent?', '["Using state", "Using props", "Using context", "Using Redux"]', 1);











































-- schema.sql
-- This script sets up the database tables for the Online Exam System.
-- It includes a password field for authentication.

-- Drop tables in reverse order of creation to respect foreign key constraints
DROP TABLE IF EXISTS exam_results;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS candidates;

-- 1. Candidates Table
-- Stores information about the exam takers with a hashed password.
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL, -- To store hashed password
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- 3. Questions Table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INTEGER NOT NULL
);

-- 4. Answers Table
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (candidate_id, question_id)
);

-- 5. Exam Results Table
CREATE TABLE exam_results (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    attempted_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX ON questions (course_id);
CREATE INDEX ON answers (candidate_id, question_id);
CREATE INDEX ON exam_results (candidate_id, course_id);


--- SAMPLE DATA ---

-- NOTE: We are not inserting a sample candidate here because registration
-- will be handled through the application's UI.

-- Insert sample courses
INSERT INTO courses (id, name) VALUES (1, 'JavaScript Fundamentals');
INSERT INTO courses (id, name) VALUES (2, 'React Basics');

-- Insert sample questions for JavaScript Fundamentals (Course ID 1)
-- (Using a smaller set for brevity in this example)
INSERT INTO questions (course_id, question_text, options, correct_option) VALUES
(1, 'What does the `typeof` operator return for `null`?', '["null", "undefined", "object", "string"]', 2),
(1, 'Which company developed JavaScript?', '["Microsoft", "Apple", "Netscape", "Sun Microsystems"]', 2),
(1, 'How do you declare a constant variable in JavaScript?', '["var", "let", "const", "static"]', 2),
(1, 'What is the result of `2 + "2"`?', '["4", "22", "Error", "NaN"]', 1),
(1, 'Which method is used to parse a JSON string?', '["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.toObject()"]', 0),
(1, 'What does `===` operator check?', '["Value only", "Type only", "Value and type", "None of the above"]', 2),
(1, 'How do you write a single line comment in JS?', '["// comment", "/* comment */", "<!-- comment -->", "# comment"]', 0),
(1, 'Which function is used to print content to the console?', '["print()", "log()", "console.log()", "display()"]', 2),
(1, 'What is the correct way to write a JavaScript array?', '["var colors = (1,2,3)", "var colors = [1,2,3]", "var colors = {1,2,3}", "var colors = <1,2,3>"]', 1),
(1, 'What does `NaN` stand for?', '["Not a Number", "No and No", "New and Null", "Not a Name"]', 0);


-- Insert sample questions for React Basics (Course ID 2)
INSERT INTO questions (course_id, question_text, options, correct_option) VALUES
(2, 'What is not React?', '["A JavaScript library for building user interfaces", "A server-side framework", "A database", "A programming language"]', 0),
(2, 'What is JSX?', '["A syntax extension for JavaScript", "A templating engine", "A CSS preprocessor", "A database query language"]', 0),
(2, 'How do you create a React component?', '["Using a function or a class", "Only using classes", "Only using functions", "Using a constructor"]', 0),
(2, 'What is the virtual DOM?', '["A direct representation of the DOM", "A copy of the DOM kept in memory", "A tool for debugging", "A browser feature"]', 1),
(2, 'How do you pass data to a component from its parent?', '["Using state", "Using props", "Using context", "Using Redux"]', 1);

