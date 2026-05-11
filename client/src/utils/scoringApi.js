import axios from "axios";

const BASE = "http://localhost:3000/api/scoring";

function getHeaders() {
  return { "x-consultant-password": sessionStorage.getItem("consultantPassword") || "" };
}

export const checkAuth = (password) =>
  axios.post(`${BASE}/auth`, {}, { headers: { "x-consultant-password": password } });

export const validateAttendance = (email, eventName) =>
  axios.get(`${BASE}/validate-attendance`, { params: { email, eventName }, headers: getHeaders() });

export const submitInfoNight = (data) =>
  axios.post(`${BASE}/info-night`, data, { headers: getHeaders() });

export const submitCaseStudy = (data) =>
  axios.post(`${BASE}/case-study`, data, { headers: getHeaders() });

export const lookupAttendee = (eventName, email) =>
  axios.get(`${BASE}/lookup-attendee`, { params: { eventName, email }, headers: getHeaders() });

export const submitAssessmentCenter = (data) =>
  axios.post(`${BASE}/assessment-center`, data, { headers: getHeaders() });

export const lookupByName = (eventName, name, proctorEmail) =>
  axios.get(`${BASE}/lookup-by-name`, { params: { eventName, name, proctorEmail }, headers: getHeaders() });

export const submitSpeedNetworking = (data) =>
  axios.post(`${BASE}/speed-networking`, data, { headers: getHeaders() });
