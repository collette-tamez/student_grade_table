/**
 * student_array - global array to hold student objects
 * @type {Array}
 */
var student_array = [];
/**
 * addClicked - Event Handler when user clicks the add button
 */
function addClicked() {
    var newStudent = new addStudent();
    sendStudentToDatabase(newStudent);
    clearAddStudentForm();
}
/**
 * cancelClicked - Event Handler when user clicks the cancel button, should clear out student form
 */
function cancelClicked() {
    clearAddStudentForm();
}
/**
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 *
 * @return undefined
 */
function addStudent( ) {
    this.studentName = $("#studentName").val();
    this.course = $("#course").val();
    this.studentGrade = $("#studentGrade").val();
}
/**
 * clearAddStudentForm - clears out the form values based on inputIds variable
 */
function clearAddStudentForm() {
    $("#studentName").val("");
    $("#course").val("");
    $("#studentGrade").val("");
    return true;
}
/**
 * calculateAverage - loop through the global student array and calculate average grade and return that value
 * @returns {number}
 */
function calculateAverage() {
    var sum = 0;
    for (var i = 0; i < student_array.length; i++){
        sum += parseInt(student_array[i].studentGrade);
    }
    var average = Math.round(sum/student_array.length);
    if (typeof student_array[0] === "undefined"){
        average = 0;
        $(".avgGrade").text(average);
    }
    return average;
}
/**
 * updateData - centralized function to update the average and call student list update
 */
function updateData(){
    updateStudentList();
    $(".avgGrade").text(calculateAverage);
    return true;
}
/**
 * updateStudentList - loops through global student array and appends each objects data into the student-list-container > list-body
 */
function updateStudentList() {
    $("tbody").empty();
    for (var i = 0; i < student_array.length; i++){
        addStudentToDom(student_array[i]);
    }
    return true;
}
/**
 * addStudentToDom - take in a student object, create html elements from the values and then append the elements
 * into the .student_list tbody
 * @param studentObj
 */
function addStudentToDom(studentObj) {
    $(".student-list-container > h2, #loading").remove();
    var entryID = studentObj.entryID;
    var tableRow = $("<tr>");
    var deleteButton = $("<button>", {
        databaseIndex: entryID
    }).addClass("btn btn-danger").text("Delete");
    $("<td>").text(studentObj.studentName).appendTo(tableRow);
    $("<td>").text(studentObj.course).appendTo(tableRow);
    $("<td>").text(studentObj.studentGrade).appendTo(tableRow);
    $("<td>").append(deleteButton).appendTo(tableRow);
    tableRow.appendTo("tbody");
}
/**
 * reset - resets the application to initial state. Global variables reset, DOM get reset to initial load state
 */
function initialize() {
    student_array = [];
    retrieveStudentDatabaseInfo();
    $(".btn-success").click(function () {
        addClicked();
    });
    $(".btn-default").click(function () {
       cancelClicked();
    });
    $("tbody").on("click",".btn-danger",function () {
        removeStudent(this);
    });
}
/**
 * Listen for the document to load and reset the data to the initial state
 */
$(document).ready(function() {
    initialize();
});
/**
 * removeStudent - removes selected student object from array and corrisponding table row from dom
 * @param: clickedButton
 */
function removeStudent(clickedButton) {
    var entryToRemove = $(clickedButton).attr("databaseIndex");
    removeStudentFromDatabase(entryToRemove);
    if(true){
        var studentArrayIndex = $(clickedButton).parents("tr");
        studentArrayIndex.addClass("bg-danger").remove();
        student_array.splice(studentArrayIndex.index(),1);
        $(".avgGrade").text(calculateAverage());
    }
}
/**
 *retrieveStudentDatabaseInfo - makes an ajax call to the LFZ API and returns the data
 */
function retrieveStudentDatabaseInfo(){
    $.ajax({
        method: "POST",
        dataType: "JSON",
        url: "php/read.php",
        error: function (response) {
            $("<p>").text("The following error occurred: " + response.responseText).appendTo(".modal-body").parents("#errorModal").modal();
            $("#loading").empty();
            $("<h2>").text("User Info Unavailable").appendTo("#loading");
        },
        success: function (response) {
            function databaseStudentObject() {}
            var studentListFromDatabase = response["data"];
            for (var i = 0; i < studentListFromDatabase.length; i++){
                var createStudentObject = new databaseStudentObject();
                createStudentObject.studentName = studentListFromDatabase[i].name;
                createStudentObject.course = studentListFromDatabase[i].course;
                createStudentObject.studentGrade = studentListFromDatabase[i].grade;
                createStudentObject.entryID = studentListFromDatabase[i].id;
                student_array.push(createStudentObject);
            }
            updateData();
        }
    });
}
/**
 * sendStudentToDatabase - takes user inputted form data and sends to database for retrieval
 */
function sendStudentToDatabase(student){
    $.ajax({
        data: {
            name: student.studentName,
            course: student.course,
            grade: student.studentGrade
        },
        method: "POST",
        dataType: "JSON",
        url: "php/create.php",
        error: function (response) {
            console.log(response);
            $("<p>").text("The following error occurred: " + response.responseText).appendTo(".modal-body").parents("#errorModal").modal();
            $("#loading").empty();
        },
        success: function (response) {
            console.log(response);
            student.entryID = response.new_id;
            student_array.push(student);
            updateData();
        }
    });
}
/**
 * removeStudentFromDatabase - makes a request to remove a student from the database by their unique id
 */
function removeStudentFromDatabase(databaseIndex){
    $.ajax({
        data:{
            entry_id: databaseIndex
        },
        method: "POST",
        dataType: "JSON",
        url: "php/delete.php",
        error: function (response) {
            $("<p>").text("The following error occurred: " + response.responseText).appendTo(".modal-body").parents("#errorModal").modal();
            $("#loading").empty();
            return false;
        },
        success: function (response) {
            $("<p>").text("Student successfully deleted").appendTo(".modal-body").parents("#errorModal").modal();
            return true;
        }
    });
}
//TODO: update operation, data sanitization, ui tweaks