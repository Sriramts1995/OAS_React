import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authservice";
import { getDetailsByEmpNumber } from "../../services/userservice";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const loginResponse = await login(email);
      console.log("Login Successful:", loginResponse);

      const userdetails = await getDetailsByEmpNumber();
      console.log("User Details:", userdetails.data);

      const empRecord = userdetails.data?.records?.[0];
      const empNumber = empRecord?.EMPLOYEE_NUMBER;

      if (empNumber) {
        // Store employee number and details in localStorage
        localStorage.setItem("empNumber", empNumber);
        localStorage.setItem("userInfo", JSON.stringify(empRecord));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Error during login sequence:", err);
      alert("Login Failed");
    }
  };

  return (
    <div className="login-wrapper">
      {/* Top Corporate Banner */}
      <div className="brand-header">
        <div className="brand-logo">
          <span className="logo-symbol">▲</span>
          <span className="logo-text">Corporate Bank</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="login-card">
        <div className="card-header">
          <h2>Portal Login</h2>
          <p>Online Approval System (OAS)</p>
        </div>

        <div className="form-group">
          <label>Employee Email</label>
          <input
            type="text"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="btn-login" onClick={handleLogin}>
          Sign In
        </button>

        <div className="card-footer">
          <p>© Axis Bank Ltd. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}