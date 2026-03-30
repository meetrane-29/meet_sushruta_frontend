import { ref } from 'vue'
import { useApi } from './useApi'

export function useOPDApi() {
  const { api, makeRequest } = useApi()
  const API_BASE = '/opd'

  // UHID Operations
  const generateUHID = async (patientID) => {
    return makeRequest(() =>
      api.post(`${API_BASE}/uhid/generate`, {
        patient_id: patientID
      })
    )
  }

  const getUHIDByPatient = async (patientID) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/uhid/patient/${patientID}`)
    )
  }

  const validateUHID = async (uhidString) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/uhid/validate/${uhidString}`)
    )
  }

  // Insurance Policy Operations
  const createInsurancePolicy = async (policyData) => {
    return makeRequest(() =>
      api.post(`${API_BASE}/insurance/policies`, policyData)
    )
  }

  const getPatientInsurancePolicies = async (patientID) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/insurance/patient/${patientID}`)
    )
  }

  const getActiveInsurancePolicy = async (patientID) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/insurance/active/${patientID}`)
    )
  }

  const updateInsurancePolicy = async (policyID, policyData) => {
    return makeRequest(() =>
      api.put(`${API_BASE}/insurance/policies/${policyID}`, policyData)
    )
  }

  const deactivateInsurancePolicy = async (policyID) => {
    return makeRequest(() =>
      api.delete(`${API_BASE}/insurance/policies/${policyID}`)
    )
  }

  // Waiting List Operations
  const addToWaitingList = async (appointmentID, patientID, doctorID) => {
    return makeRequest(() =>
      api.post(`${API_BASE}/waiting-list/add`, {
        appointment_id: appointmentID,
        patient_id: patientID,
        doctor_id: doctorID
      })
    )
  }

  const getDoctorWaitingList = async (doctorID) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/waiting-list/doctor/${doctorID}`)
    )
  }

  const callNextPatient = async (doctorID) => {
    return makeRequest(() =>
      api.post(`${API_BASE}/waiting-list/call-next/${doctorID}`)
    )
  }

  const markPatientSeen = async (entryID) => {
    return makeRequest(() =>
      api.put(`${API_BASE}/waiting-list/${entryID}/mark-seen`)
    )
  }

  const completeConsultation = async (entryID) => {
    return makeRequest(() =>
      api.put(`${API_BASE}/waiting-list/${entryID}/complete`)
    )
  }

  const cancelWaitingListEntry = async (entryID) => {
    return makeRequest(() =>
      api.delete(`${API_BASE}/waiting-list/${entryID}/cancel`)
    )
  }

  const getPatientQueuePosition = async (patientID) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/waiting-list/patient/${patientID}/position`)
    )
  }

  const getEstimatedWaitTime = async (doctorID) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/waiting-list/doctor/${doctorID}/estimated-time`)
    )
  }

  // OPD Receipt Operations
  const generateOPDReceipt = async (receiptData) => {
    return makeRequest(() =>
      api.post(`${API_BASE}/receipt/generate`, receiptData)
    )
  }

  const getOPDReceipt = async (receiptID) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/receipt/${receiptID}`)
    )
  }

  const getOPDReceiptByNumber = async (receiptNumber) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/receipt/number/${receiptNumber}`)
    )
  }

  const getPatientOPDReceipts = async (patientID, limit = 10, offset = 0) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/receipt/patient/${patientID}`, {
        params: { limit, offset }
      })
    )
  }

  const printOPDReceipt = async (receiptID) => {
    return makeRequest(() =>
      api.post(`${API_BASE}/receipt/${receiptID}/print`)
    )
  }

  const getReceiptSummary = async (receiptID) => {
    return makeRequest(() =>
      api.get(`${API_BASE}/receipt/${receiptID}/summary`)
    )
  }

  return {
    // UHID
    generateUHID,
    getUHIDByPatient,
    validateUHID,
    // Insurance
    createInsurancePolicy,
    getPatientInsurancePolicies,
    getActiveInsurancePolicy,
    updateInsurancePolicy,
    deactivateInsurancePolicy,
    // Waiting List
    addToWaitingList,
    getDoctorWaitingList,
    callNextPatient,
    markPatientSeen,
    completeConsultation,
    cancelWaitingListEntry,
    getPatientQueuePosition,
    getEstimatedWaitTime,
    // Receipt
    generateOPDReceipt,
    getOPDReceipt,
    getOPDReceiptByNumber,
    getPatientOPDReceipts,
    printOPDReceipt,
    getReceiptSummary
  }
}
