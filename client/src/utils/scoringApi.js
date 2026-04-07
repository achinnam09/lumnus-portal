import axios from "axios";

const BASE = "http://localhost:3000/api/scoring";

function getHeaders() {
  return { "x-consultant-password": sessionStorage.getItem("consultantPassword") || "" };
}

export const checkAuth = (password) =>
  axios.post(`${BASE}/auth`, {}, { headers: { "x-consultant-password": password } });

export const validateAttendance = (pid, eventName) =>
  axios.get(`${BASE}/validate-attendance`, { params: { pid, eventName }, headers: getHeaders() });

export const submitInfoNight = (data) =>
  axios.post(`${BASE}/info-night`, data, { headers: getHeaders() });

export const submitCaseStudy = (data) =>
  axios.post(`${BASE}/case-study`, data, { headers: getHeaders() });
