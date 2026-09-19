import "./Dashboard.css";
import { useEffect, useState } from "react";
import {
  getPendingListByEmpId,
  getrequestsdetailsById,
  getInitiatedListByEmpId,
  getApprovedListByEmpId,
  getRejectedListByEmpId,
  advancedSearch
} from "../../services/requestservice";
import { useNavigate } from "react-router-dom";
import { formatDate, getInitials } from "../../utils/utils";
import ChatWidget from "../../components/ChatWidget/ChatWidget";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("pending"); // Track 'pending' or 'initiated'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [initiatedRequests, setInitiatedRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Advance Search Form State
  const [searchFilter, setSearchFilter] = useState("oasnumber"); // 'oasnumber' or 'subject'
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  //getApprovedListByEmpId, getRejectedListByEmpId
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  //   useEffect(() => {
  //   const fetchAllData = async () => {
  //     setLoading(true);
  //     try {
  //       const empNumber = localStorage.getItem("empNumber");

  //       const [pendingRes, initiatedRes] = await Promise.all([
  //         getPendingListByEmpId(empNumber),
  //         getInitiatedListByEmpId(empNumber)
  //       ]);

  //       if (pendingRes.data?.records) {
  //         setPendingRequests(pendingRes.data.records);
  //       }
  //       if (initiatedRes.data?.records) {
  //         setInitiatedRequests(initiatedRes.data.records);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching dashboard data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchAllData();
  // }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const empNumber = localStorage.getItem("empNumber");

      const response = await getPendingListByEmpId(empNumber);
      if (response.data && response.data.records) {
        setPendingRequests(response.data.records);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitiatedRequests = async () => {
    setLoading(true);
    try {
      const empNumber = localStorage.getItem("empNumber");

      const response = await getInitiatedListByEmpId(empNumber);
      if (response.data && response.data.records) {
        setInitiatedRequests(response.data.records);
      }
    } catch (error) {
      console.error("Error fetching initiated requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedRequests = async () => {
    setLoading(true);
    try {
      const empNumber = localStorage.getItem("empNumber");

      const response = await getApprovedListByEmpId(empNumber);
      if (response.data && response.data.records) {
        setApprovedRequests(response.data.records);
      }
    } catch (error) {
      console.error("Error fetching approved requests:", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchRejectedRequests = async () => {
    setLoading(true);
    try {
      const empNumber = localStorage.getItem("empNumber");

      const response = await getRejectedListByEmpId(empNumber);
      if (response.data && response.data.records) {
        setRejectedRequests(response.data.records);
      }
    } catch (error) {
      console.error("Error fetching rejected requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Advance Search API Submit
  const handleAdvanceSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActiveTab("search");

    try {
      const empNumber = localStorage.getItem("empNumber") || "100203";
      const response = await advancedSearch({
        filterp: searchFilter,
        filterconditionp: searchKeyword,
        fromdate: fromDate,
        todate: toDate,
        loginuser: empNumber,
      });

      console.log("Advance Search Response:", response.data);

      const records =
        response.data?.records ||
        response.data?.recordsList ||
        response.data?.searchrecords ||
        [];

      setSearchResults(records);
    } catch (error) {
      console.error("Error running advance search:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };


  // Tab Switch Handler
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === "pending") {
      fetchPendingRequests();
    } else if (tabName === "initiated") {
      fetchInitiatedRequests();
    } else if (tabName === "approved") {
      fetchApprovedRequests();
    } else if (tabName === "rejected") {
      fetchRejectedRequests();
    }
  };

  // Row Click Handler: Fetch Request Details and Navigate
  const handleRowClick = async (item) => {
    try {
      console.log("Fetching details for Request ID:", item.Id);
      const response = await getrequestsdetailsById(item.Id);
      console.log("Request Details Response:", response.data);

      // Navigate to view page with fetched details
      navigate("/view", { state: { requestData: response.data, activeTab } });
    } catch (error) {
      console.error("Error fetching request details:", error);
      alert("Failed to fetch request details.");
    }
  };

  // Replaces previous calculation with exact Volt MX Math.round logic
  const calculatePendingDays = (assignedDateStr) => {
    if (!assignedDateStr) return "N/A";
    const cleanStr = assignedDateStr.replace(" ", "T");
    const assignedDate = new Date(cleanStr);
    const currentDate = new Date();
    const timeDifference = currentDate - assignedDate;
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return Math.round(daysDifference);
  };

  // Status Badge Formatter for Dashboard Tabs
  const renderStatusBadge = (statusCode) => {
    const code = String(statusCode);
    if (code === "1") {
      return <span style={{ color: "#d97706", fontWeight: "600" }}>Pending</span>;
    }
    if (code === "4") {
      return <span style={{ color: "#7c3aed", fontWeight: "600" }}>Approved</span>;
    }
    if (code === "5") {
      return <span style={{ color: "#e11d48", fontWeight: "600" }}>Rejected</span>;
    }
    if (code === "3") {
      return <span style={{ color: "#d97706", fontWeight: "600" }}>Sent Back</span>;
    }
    return <span>{statusCode}</span>;
  };

  const navigateToCreate = () => {
    navigate("/create");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Dynamic UI Labels & Data Mapping for Right Panel
  const tabConfig = {
    pending: {
      title: "Pending Requests",
      subtitle: "Here is an overview of your pending tasks and approvals.",
      data: pendingRequests,
    },
    initiated: {
      title: "Initiated Requests",
      subtitle: "Here is an overview of requests initiated by you.",
      data: initiatedRequests,
    },
    approved: {
      title: "Approved Requests",
      subtitle: "Here is an overview of your completed and approved requests.",
      data: approvedRequests,
    },
    rejected: {
      title: "Rejected Requests",
      subtitle: "Here is an overview of requests that were rejected.",
      data: rejectedRequests,
    },
    search: {
      title: "Search Results",
      subtitle: "Here are the records matching your advance search criteria.",
      data: searchResults,
    },
  };

  const currentTabInfo = tabConfig[activeTab] || tabConfig.pending;
  const currentRequests = currentTabInfo.data;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  return (
    <div className="app-container">
      {/* Top Global Navigation Bar */}
      <header className="top-navbar">
        <div className="nav-brand">
          <span className="brand-icon">▲</span>
          <span className="brand-name">Corporate Bank</span>
        </div>

        {/* Right Section Container: User Info + Logout */}
        <div className="nav-right-group">
          <div className="nav-user-profile">
            <div className="avatar-circle">{getInitials(userInfo.Display_Name)}</div>
            <div className="user-details-nav">
              <span className="user-name">{userInfo.Display_Name}</span>
              <span className="user-role">{userInfo.Grade_Code + " / " + userInfo.EMPLOYEE_NUMBER}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <div className="workspace-layout">
        {/* Left Sidebar Menu */}
        <aside className="sidebar">
          <button className="btn-create-request" onClick={navigateToCreate}>
            <span className="plus-icon">+</span> Create New Request
          </button>

          <nav className="sidebar-menu">
            <a className={`menu-item ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => handleTabChange("pending")}
            >
              Pending Requests
              {/*<span className="menu-badge">{pendingRequests.length}</span>*/}
            </a>
            <a
              className={`menu-item ${activeTab === "initiated" ? "active" : ""}`}
              onClick={() => handleTabChange("initiated")}
            >
              Initiated Requests
              {/*<span className="menu-badge">{initiatedRequests.length}</span>*/}
            </a>
            <a
              className={`menu-item ${activeTab === "approved" ? "active" : ""}`}
              onClick={() => handleTabChange("approved")}
            >
              Approved Requests
              {/*<span className="menu-badge">{approvedRequests.length}</span>*/}
            </a>
            <a
              className={`menu-item ${activeTab === "rejected" ? "active" : ""}`}
              onClick={() => handleTabChange("rejected")}
            >
              Rejected Requests
              {/*<span className="menu-badge">{rejectedRequests.length}</span>*/}
            </a>
          </nav>

          {/* Advance Search Panel */}
          <div className="sidebar-search-card">
            <h4 className="search-panel-title">Advance Search</h4>
            <form onSubmit={handleAdvanceSearch} className="search-form">
              <div className="search-field">
                <label>Memo Type</label>
                <input type="text" value="Non-Financial" disabled readOnly />
              </div>

              <div className="search-field">
                <label>Search By</label>
                <select
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                >
                  <option value="oasnumber">OAS Number</option>
                  <option value="subject">Subject</option>
                </select>
              </div>

              <div className="search-field">
                <label>Keyword</label>
                <input
                  type="text"
                  placeholder="Enter search value..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>

              <div className="search-field">
                <label>From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="search-field">
                <label>To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-advance-search">
                Search
              </button>
            </form>
          </div>
        </aside>

        {/* Right Content View */}
        <main className="main-viewport">
          <div className="welcome-banner">
            <h2>Welcome to your Dashboard</h2>
            <p>{currentTabInfo.subtitle}</p>
          </div>

          <div className="content-card">
            <div className="card-top">
              <div className="title-group">
                <h3>{currentTabInfo.title}</h3>
                <span className="count-pill">{currentRequests.length}</span>
              </div>
            </div>

            {loading ? (
              <div className="state-msg">Fetching records...</div>
            ) : currentRequests.length === 0 ? (
              <div className="state-msg">
                No {activeTab} requests found.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    {activeTab === "rejected" ? (
                      <tr>
                        <th>Reference No</th>
                        <th>Subject</th>
                        <th>Memo Type</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Rejected Date</th>
                      </tr>
                    ) : activeTab === "approved" ? (
                      <tr>
                        <th>Reference No</th>
                        <th>Subject</th>
                        <th>Department</th>
                        <th>Current Status</th>
                        <th>Pending With</th>
                        <th>Last Updated</th>
                      </tr>
                    ) : activeTab === "initiated" ? (
                      <tr>
                        <th>Reference No</th>
                        <th>Subject</th>
                        <th>Memo Type</th>
                        <th>Current Status</th>
                        <th>Pending With</th>
                        <th>Pending Days</th>
                      </tr>
                    ) : (
                      <tr>
                        <th>Reference No</th>
                        <th>Subject</th>
                        <th>Memo Type</th>
                        <th>Initiator</th>
                        <th>Department</th>
                        <th>Pending Since</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {currentRequests.map((item) => (
                      <tr
                        key={item.Id}
                        onClick={() => handleRowClick(item)}
                        className="clickable-row"
                      >
                        <td className="font-highlight">{item.axisrequestid}</td>
                        <td>{item.subject}</td>
                        {activeTab === "rejected" ? (
                          <>
                            <td>{item.memoname}</td>
                            <td>{item.initiatordept}</td>
                            <td>{renderStatusBadge(item.status)}</td>
                            <td>{formatDate(item.updatedat)}</td>
                          </>
                        ) : activeTab === "approved" ? (
                          <>
                            <td>{item.initiatordept}</td>
                            <td>{renderStatusBadge(item.status)}</td>
                            <td>
                              {String(item.status) === "1" ? item.currentusername || "" : ""}
                            </td>
                            <td>{formatDate(item.updatedat)}</td>
                          </>
                        ) : activeTab === "initiated" ? (
                          <>
                            <td>{item.memoname}</td>
                            <td>{renderStatusBadge(item.status)}</td>
                            <td>
                              {String(item.status) === "1" ? item.currentusername || "" : ""}
                            </td>
                            <td>
                              {String(item.status) === "1" ? (
                                <span className="badge-pending">
                                  {calculatePendingDays(item.assigneddate)} days
                                </span>
                              ) : (
                                ""
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{item.memoname}</td>
                            <td>{item.initiatorname}</td>
                            <td>{item.initiatordept}</td>
                            <td>
                              <span className="badge-pending">
                                {calculatePendingDays(item.assigneddate)} days
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      <div className="app-container">
        {/* ... Header and Workspace layout ... */}

        {/* Floating Chat Copilot Widget */}
        <ChatWidget />
      </div>
    </div>
  );
}