<?php
require_once('mysql_connect.php');////connect to database
$output = ['success'=> false];
if(!$conn){
    //throw an error if connection fails
    $output['message'] = "Fatal Error: could not reach database";
    $fatal_error = json_encode($output);
    print_r($fatal_error);
    exit();
}
$student_name = $_POST['name'];
$course_name = $_POST['course'];
$student_grade = $_POST['grade'];

//CONDITIONAL TO RETRIEVE COURSE ID
$course_select_query = "SELECT `ID` FROM `Courses` WHERE `name`='$course_name'";
$course_query_results = mysqli_query($conn, $course_select_query);
if(mysqli_num_rows($course_query_results) > 0){
    while ($row = mysqli_fetch_assoc($course_query_results)){
        $course_id = $row['ID'];
    }
} else {
    ///IF COURSE NOT FOUND  CREATE A QUERY TO ADD COURSE TO DATABASE
    $course_insert_query = "INSERT INTO `Courses` (`name`, `instructor_id`, `date created`) VALUES('$course_name', '1', NOW())";

}
////CONDITIONAL TO RETRIEVE STUDENT ID
$student_select_query = "SELECT `ID` FROM `Students` WHERE `name`='$student_name'";
$student_query_results = mysqli_query($conn, $student_select_query);
if(mysqli_num_rows($student_query_results) > 0){
    while ($row = mysqli_fetch_assoc($student_query_results)){
        $student_id = $row['ID'];
    }
} else {
    $student_insert_query = "INSERT INTO `Students` (`name`, `created`) VALUES('$student_name', NOW())";
}
///CONDITIONAL TO CHECK IF STUDENT ALREADY HAS GRADE IN DATABASE
if(isset($student_id) and isset($course_id)){
    $grade_select_query = "SELECT g.created FROM `Grades` AS g JOIN `Students` AS s ON s.id = g.student_id JOIN `Courses` AS c ON c.id = g.course_id WHERE s.id = '$student_id' AND c.id = '$course_id'";
    $grade_query_results = mysqli_query($conn, $grade_select_query);
    if (mysqli_num_rows($grade_query_results) > 0){
        $output['responseText'] = "ERROR ENTRY ALREADY EXISTS IN DATABASE PLEASE UPDATE EXISTING GRADE";
        $json_error_response = json_encode($output);
        print_r($json_error_response);
        exit();
    }
}
//////
mysqli_begin_transaction($conn, MYSQLI_TRANS_START_READ_WRITE);
if (!isset($course_id)){
    mysqli_query($conn, $course_insert_query);
    $course_id = mysqli_insert_id($conn);
    mysqli_commit($conn);
}
if (!isset($student_id)){
    mysqli_query($conn, $student_insert_query);
    $student_id = mysqli_insert_id($conn);
    mysqli_commit($conn);
}
///need to return grade id not student id
$grade_insert_query = "INSERT INTO `Grades` (Grades.student_id, Grades.course_id, Grades.grade, Grades.created) VALUES('$student_id', '$course_id', '$student_grade', NOW())";
mysqli_query($conn, $grade_insert_query);
$entry_id = mysqli_insert_id($conn);
mysqli_commit($conn);
$confirm_insert_query = "SELECT * FROM  `grades` WHERE `id`='$entry_id'";
$confirmation = mysqli_query($conn, $confirm_insert_query);
mysqli_commit($conn);
if(mysqli_num_rows($confirmation) > 0){
    $output['success'] = true;
    $output['new_id'] = $entry_id;
} else {
    $output['error'] = "FATAL ERROR STUDENT NOT SENT TO DATABASE";
}
$json_output = json_encode($output);
print_r($json_output);
mysqli_close($conn); ////closing database connection
?>
