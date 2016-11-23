<?php
require_once ('mysql_connect.php'); ///connects to database
if(!$conn){
    //throw an error if connection fails
    $output['message'] = "Fatal Error: could not reach database";
    $fatal_error = json_encode($output);
    print_r($fatal_error);
    exit();
}
$output = ['success'=> false];
////FINAL QUERY RETURNING DATA TO BE DISPLAYED IN SGT CMS
$query = "SELECT s.name, g.id, g.grade, c.name AS 'course' FROM `Students` AS s JOIN `Grades` AS g ON g.student_id = s.id JOIN `Courses` AS c ON c.id = g.course_id ORDER BY g.id ASC";
/////MYSQULI CALL TO DATABASE USING QUERY
$result = mysqli_query($conn, $query);
///IF QUERY RETURNED RESULTS
if(mysqli_num_rows($result) > 0){
    //LOOP THROUGH ARRAY
    while ($row = mysqli_fetch_assoc($result)){
        ///PUSH EACH ARRAY ITEM INTO OUTPUT DATA ARRAY
        $output['data'][] = $row;
    }
    ///SET OUTPUT OBJECTS SUCCESS VALUE TO TRUE
    $output['success'] = true;
} else {
    ///SET OUTPUT OBJECTS SUCCESS VALUE TO FALSE IF NO RESULTS FOUND
    $output['error'] = 'NO DATA FOUND';
}
///TURN OUTPUT VARIABLE IN TO A JSON OBJECT
$json_output = json_encode($output);
///PRINT FOR FRONTEND RETRIEVAL
print_r($json_output);
mysqli_close($conn); ////closing database connection
?>