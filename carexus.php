<?php

class Carexus {
    public function getAppointments($patientId) {
        $query = "
            SELECT 
                a.appointment_id, 
                ds.available_date as appointment_date,
                ds.time_slot as appointment_time,
                a.purpose, 
                a.status, 
                a.remarks,
                d.firstname AS doctor_firstname, 
                d.lastname AS doctor_lastname
            FROM 
                appointments a
            JOIN 
                doctors d ON a.doctor_id = d.doctor_id
            JOIN 
                doctor_schedules ds ON a.schedule_id = ds.schedule_id
            WHERE 
                a.patient_id = :patientId
            ORDER BY 
                ds.available_date, ds.time_slot
        ";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':patientId', $patientId, PDO::PARAM_INT);
            $stmt->execute();
            $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'status' => true,
                'appointments' => $appointments
            ];
        } catch (PDOException $e) {
            return [
                'status' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        }
    }
} 