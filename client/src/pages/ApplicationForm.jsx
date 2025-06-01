import { useState } from "react";
import "./ApplicationForm.css";

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    pid: "",
    email: "",
    major: "",
    minor: "",
    track: "",
    essay1: "",
    essay2: "",
    heardFrom: "",
    heardFromOther: "",
    resume: null,
    headshot: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (e.target.type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // …submission logic remains unchanged…
  };

  return (
    <div className="application-form-page">
      <form onSubmit={handleSubmit}>
        <h2>Apply to Lumnus Consulting</h2>
        {/* ----- Name ----- */}
        <div>
          <label>Name:</label><br />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* ----- Year ----- */}
        <div>
          <label>Year:</label><br />
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
          >
            <option value="">-- Select year --</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Transfer">Transfer</option>
          </select>
        </div>

        {/* ----- PID ----- */}
        <div>
          <label>PID:</label><br />
          <input
            type="text"
            name="pid"
            value={formData.pid}
            onChange={handleChange}
            required
          />
        </div>

        {/* ----- UCSD Email ----- */}
        <div>
          <label>UCSD Email:</label><br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* ----- Major ----- */}
        <div>
          <label>Major:</label><br />
          <input
            type="text"
            name="major"
            value={formData.major}
            onChange={handleChange}
            required
          />
        </div>

        {/* ----- Minor (Optional) ----- */}
        <div>
          <label>Minor (Optional):</label><br />
          <input
            type="text"
            name="minor"
            value={formData.minor}
            onChange={handleChange}
          />
        </div>

        {/* ----- Track Choice (Radio Buttons) ----- */}
        <div className="track-choice-group">
            <label>Track Choice:</label>
            <div className="radio-row">
                <span>Strategy</span>
                <input
                type="radio"
                name="track"
                value="Strategy"
                checked={formData.track === "Strategy"}
                onChange={handleChange}
                required
                />
            </div>
            <div className="radio-row">
                <span>Data Analytics</span>
                <input
                type="radio"
                name="track"
                value="DataAnalytics"
                checked={formData.track === "DataAnalytics"}
                onChange={handleChange}
                required
                />
            </div>
        </div>



        {/* ----- Essay #1 (max 300 words) ----- */}
        <div>
          <label>
            Why are you interested in joining Lumnus Consulting? What do you have 
            to gain from this opportunity? (Max 300 Words)
          </label><br />
          <textarea
            name="essay1"
            value={formData.essay1}
            onChange={handleChange}
            rows={8}
            required
          />
          <p>
            {formData.essay1.trim().split(/\s+/).filter(Boolean).length} / 300 words
          </p>
        </div>

        {/* ----- Essay #2 (max 200 words) ----- */}
        <div>
          <label>
            If you could work for any company, which one would you work for and why?
            (Max 200 words)
          </label><br />
          <textarea
            name="essay2"
            value={formData.essay2}
            onChange={handleChange}
            rows={6}
            required
          />
          <p>
            {formData.essay2.trim().split(/\s+/).filter(Boolean).length} / 200 words
          </p>
        </div>

        {/* ----- Resume (PDF) ----- */}
        <div>
          <label>Resume (PDF):</label><br />
          <input
            type="file"
            name="resume"
            accept=".pdf"
            onChange={handleChange}
            required
          />
        </div>

        {/* ----- Headshot (JPG or PNG) ----- */}
        <div>
          <label>Headshot (JPG or PNG):</label><br />
          <input
            type="file"
            name="headshot"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />
        </div>

        {/* ----- How did you hear about us? ----- */}
        <div>
          <label>How did you hear about Lumnus Consulting</label><br />
          <select
            name="heardFrom"
            value={formData.heardFrom}
            onChange={handleChange}
            required
          >
            <option value="">-- Select an option --</option>
            <option value="Tabling at Library Walk">Tabling at Library Walk</option>
            <option value="Meet the Orgs">Meet the Orgs</option>
            <option value="Instagram">Instagram</option>
            <option value="Friends/Family/Word of Mouth">Friends/Family/Word of Mouth</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Online Website">Online Website</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {formData.heardFrom === "Other" && (
          <div>
            <label>Please specify:</label><br />
            <input
              type="text"
              name="heardFromOther"
              value={formData.heardFromOther || ""}
              onChange={(e) =>
                setFormData({ ...formData, heardFromOther: e.target.value })
              }
              required
            />
          </div>
        )}

        <div>
          <button type="submit">Submit Application</button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
