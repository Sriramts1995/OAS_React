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

  const calculatePendingDays = (assignedDateStr) => {
    if (!assignedDateStr) return "N/A";
    const assignedDate = new Date(assignedDateStr);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - assignedDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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
            <div className="avatar-circle">ST</div>
            <div className="user-details-nav">
              <span className="user-name">Sriram There</span>
              <span className="user-role">AM / ID: 100203</span>
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
                    <tr>
                      <th>Reference No</th>
                      <th>Subject</th>
                      <th>Memo Type</th>
                      <th>Initiator</th>
                      <th>Last Updated</th>
                      <th>Pending Since</th>
                    </tr>
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
                        <td>{item.memoname}</td>
                        <td>{item.initiatorname}</td>
                        <td>{item.updatedat?.split(" ")[0]}</td>
                        <td>
                          <span className="badge-pending">
                            {calculatePendingDays(item.assigneddate)} days
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}