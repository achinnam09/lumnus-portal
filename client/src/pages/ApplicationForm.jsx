import { useState } from "react";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Application submitted (functionality coming next)");
    // Form submission logic will go here
  };

  return (
    <div>
      <h2>Apply to Lumnus Consulting</h2>
      <form onSubmit={handleSubmit}>
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

        <div>
            <label>Year:</label><br />
            <select
                name="year"
                value={formData.year}
                onChnage={handleChange}
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

        <div>
            <label>Minor (Optional):</label><br />
            <input
                type="text"
                name="minor"
                value={formData.minor}
                onChange={handleChange}
            />
        </div>

        <div>
            <label>Track Choice:</label><br />
            <input
                type="radio"
                name="track"
                value="Strategy"
                checked={formData.track === "Strategy"}
                onChange={handleChange}
                required
            />
            Strategy 
            <br />
            <input
                type="radio"
                name="track"
                value="Data Analytics"
                checked={formData.track === "Data Analytics"}
                onChange={handleChange}
                required
            />
            Data Analytics
        </div>

        <div>
            <label>
                Why are you interested in joining Lumnus Consulting? What do you have to gain from this opportunity?
                (Max 300 Words)
            </label><br />
            <textarea
                name="essay1"
                value={formData.essay1}
                onChange={handleChange}
                rows={8}
                required
            />
            <p>{formData.essay1.trim().split(/\s+/).filter(Boolean).length} / 300 words</p>
        </div>

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
            <p>{formData.essay2.trim().split(/\s+/).filter(Boolean).length} / 200 words</p>
        </div>

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

        <div>
            <label>How did you hear about Lumnus Consulting</label><br />
            <select
                name="heardFrom"
                value={formData.heardFrom}
                onChange={handleChange}
                required
            >
                <option value="">-- Select and option --</option>
                <option value="Tabling at Library Walk">Tabling at Library Walk</option>
                <option value="Meet the Orgs">Meet the Orgs</option>
                <option value="Instragram">Instagram</option>
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
                        setFormData({ ...formData, heardFromOther: e.target.value})
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
