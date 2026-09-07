import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApprovarDetailsById } from "../../../services/userservice";
import { submitrequest } from "../../../services/requestservice";
import InputField from "../../../components/InputField";
import TextAreaField from "../../../components/TextAreaField";
import "./NFCreate.css";

export default function NFCreate() {
  const navigate = useNavigate();
  const memoType = "Non - Financial";

  // Dynamic Approvers Array State (Max 3)
  const [approvers, setApprovers] = useState([
    { empId: "", empName: "", department: "", email: "", gradeCode: "" },
  ]);

  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add new approver row (up to max 3)
  const addApproverRow = () => {
    if (approvers.length < 3) {
      setApprovers((prev) => [
        ...prev,
        { empId: "", empName: "", department: "", email: "", gradeCode: "" },
      ]);
    }
  };

  // Remove an approver row
  const removeApproverRow = (index) => {
    if (approvers.length > 1) {
      setApprovers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Handle input change for a specific approver row
  const handleApproverChange = (index, field, value) => {
    setApprovers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Fetch Approver Details for a specific row index
  const fetchApproverDetails = async (index) => {
    const targetEmpId = approvers[index].empId;
    if (!targetEmpId.trim()) return;

    try {
      const response = await getApprovarDetailsById(targetEmpId);

      if (
        response.data &&
        response.data.records &&
        response.data.records.length > 0
      ) {
        const empRecord = response.data.records[0];
        setApprovers((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            empName: empRecord.Display_Name || "",
            department: empRecord.Department || "",
            email: empRecord.EMAIL_ADDRESS || "",
            gradeCode: empRecord.Grade_Code || "",
          };
          return updated;
        });
      } else {
        alert("Employee ID not found.");
        setApprovers((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            empName: "",
            department: "",
            email: "",
            gradeCode: "",
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error fetching approver details:", error);
    }
  };

  const handleEmpIdKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchApproverDetails(index);
    }
  };

  // Submit Request Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all approver fields are filled out
    const invalidApprover = approvers.find(
      (app) => !app.empId.trim() || !app.empName.trim(),
    );
    if (invalidApprover) {
      alert(
        "Please select valid approvers for all added rows before submitting.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const currentDate = new Date().toISOString().replace("Z", "");

      // Map dynamic approver array into backend schema
      const dynamicApproversPayload = approvers.map((app, idx) => ({
        approvarid: app.empId,
        approvarname: app.empName,
        approvardeptid: null,
        approvardeptname: app.department,
        status: 1,
        sequence: idx + 1, // Sequence 1, 2, 3
        isskipped: 0,
        assigneddate: null,
        completiondate: null,
        requestid: null,
        Grade_Code: app.gradeCode || "AM",
        email: app.email || "",
        updatedat: null,
        createdat: currentDate,
      }));

      // Initiator sequence 0 + dynamic approver sequence
      const fullApproverList = [
        {
          approvarid: "100203",
          approvarname: "Sriram There",
          approvardeptid: null,
          approvardeptname: "C002:Information Technology - Infrastructure",
          status: 20,
          sequence: 0,
          isskipped: 0,
          assigneddate: null,
          completiondate: null,
          requestid: null,
          createdat: currentDate,
          updatedat: null,
          email: "sriram.there@hcl-software.com",
        },
        ...dynamicApproversPayload,
      ];

      const payload = {
        initiatorid: "100203",
        initiatorname: "Sriram There",
        initiatordept: "C002:Information Technology - Infrastructure",
        ip: "192.168.0.107",
        history: [
          {
            fromid: "100203",
            fromname: "Sriram There",
            toid: null,
            toname: null,
            fromstatus: 0,
            tostatus: null,
            requestid: null,
            remarks: remarks || "test from react",
            ip: "192.168.0.107",
            createdat: currentDate,
            updatedat: currentDate,
          },
        ],
        memotypeid: 1,
        submemotypeid: 1,
        memoname: memoType,
        submemoname: "Generic",
        requestdetails: [
          {
            description: btoa(unescape(encodeURIComponent(details))),
            requestid: null,
            createdat: currentDate,
            updatedat: currentDate,
          },
        ],
        subject: subject,
        initiatorremarks: remarks,
        requesttype: "request",
        currentuserstatus: 1,
        status: 1,
        createdat: currentDate,
        updatedat: currentDate,
        assigneddate: currentDate,
        overallcompletiondate: null,
        approvar: fullApproverList,
        attachment: [],
        currentuser: approvers[0].empId, // Assigned to 1st approver
        currentusername: approvers[0].empName,
        fyi: [],
        email: {},
      };

      console.log("Sending Payload:", payload);
      const response = await submitrequest(payload);
      console.log("Submit Response:", response.data);

      alert("Request Submitted Successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-page-container">
      {/* Top Header */}
      <header className="create-header">
        <div className="header-left">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
          <h2>New Request Form</h2>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="nf-create-form"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <div className="form-workspace">
        <form id="nf-create-form" onSubmit={handleSubmit} className="form-card">
          {/* Header Bar */}
          <div className="form-meta-row">
            <div className="meta-field-group">
              <div className="meta-field">
                <label>Memo Type</label>
                <input type="text" value={memoType} readOnly disabled />
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          {/* Section 1: Approver Line-Up (Dynamic Rows up to 3) */}
          <div className="form-section">
            <div className="section-title-row">
              <h4 className="section-title">
                Approver Line-Up <span className="title-sub">(Max 3)</span>
              </h4>
              {approvers.length < 3 && (
                <button
                  type="button"
                  className="btn-add-approver"
                  onClick={addApproverRow}
                >
                  + Add Approver
                </button>
              )}
            </div>

            {approvers.map((app, index) => (
              <div className="approver-row" key={index}>
                <div className="row-number">{index + 1}</div>

                <InputField
                  label="Search by Emp ID"
                  className="flex-1"
                  placeholder="Enter Emp ID & Press Enter"
                  value={app.empId}
                  onChange={(e) =>
                    handleApproverChange(index, "empId", e.target.value)
                  }
                  onKeyDown={(e) => handleEmpIdKeyDown(e, index)}
                  onBlur={() => fetchApproverDetails(index)}
                />

                <InputField
                  label="Emp Name"
                  className="flex-2"
                  placeholder="Employee Name"
                  value={app.empName}
                  readOnly
                />

                <InputField
                  label="Department"
                  className="flex-2"
                  placeholder="Department Name"
                  value={app.department}
                  readOnly
                />

                {approvers.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-row"
                    onClick={() => removeApproverRow(index)}
                    title="Remove Approver"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <hr className="section-divider" />

          {/* Section 2: Subject Line */}
          <div className="form-section">
            <InputField
              label="Subject Line"
              required
              placeholder="Type your request subject line here..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={255}
              hint="Max 255 characters."
            />
          </div>

          {/* Section 3: Details */}
          <div className="form-section">
            <TextAreaField
              label="Details"
              required
              rows={6}
              placeholder="Type detailed description here..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          {/* Section 4: Initiator Remarks */}
          <div className="form-section">
            <TextAreaField
              label="Initiator Remarks / Recommendations"
              rows={3}
              placeholder="Type initiator remarks or recommendations..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </form>
      </div>
    </div>
  );
}