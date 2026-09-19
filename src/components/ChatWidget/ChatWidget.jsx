import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPendingListByEmpId,
  getApprovedListByEmpId,
  getRejectedListByEmpId,
  getrequestsdetailsById,
  advancedSearch,
} from "../../services/requestservice";
import "./ChatWidget.css";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your OAS Assistant. How can I help you today?",
      chips: ["Show Pending Requests", "Summary Metrics", "Create New Request"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleWidget = () => setIsOpen((prev) => !prev);

  const addMessage = (sender, text, extra = {}) => {
    setMessages((prev) => [...prev, { sender, text, ...extra }]);
  };

  const handleNavigateToView = async (requestId) => {
    try {
      const response = await getrequestsdetailsById(requestId);
      navigate("/view", {
        state: { requestData: response.data, activeTab: "pending" },
      });
    } catch (error) {
      console.error("Error opening request from chat:", error);
      alert("Failed to fetch request details.");
    }
  };

  const processIntent = async (userText) => {
    const textLower = userText.toLowerCase().trim();
    const empNumber = localStorage.getItem("empNumber") || "100203";

    setLoading(true);

    try {
      // 1. Pending Requests Intent
      if (
        textLower.includes("pending") ||
        textLower.includes("task") ||
        textLower.includes("to do")
      ) {
        const response = await getPendingListByEmpId(empNumber);
        const records = response.data?.records || [];

        if (records.length === 0) {
          addMessage("bot", "You currently have 0 pending requests awaiting approval.");
        } else {
          addMessage(
            "bot",
            `You have ${records.length} pending request(s) awaiting your action:`,
            { cards: records.slice(0, 5) }
          );
        }
      }
      // 2. Summary / Metrics Intent
      else if (
        textLower.includes("summary") ||
        textLower.includes("metric") ||
        textLower.includes("count") ||
        textLower.includes("stats") ||
        textLower.includes("overview")
      ) {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          getPendingListByEmpId(empNumber),
          getApprovedListByEmpId(empNumber),
          getRejectedListByEmpId(empNumber),
        ]);

        const pendingCount = pendingRes.data?.records?.length || 0;
        const approvedCount = approvedRes.data?.records?.length || 0;
        const rejectedCount = rejectedRes.data?.records?.length || 0;

        addMessage("bot", "Here is your overall OAS workflow summary:", {
          metrics: {
            Pending: pendingCount,
            Approved: approvedCount,
            Rejected: rejectedCount,
          },
        });
      }
      // 3. Approved / Completed Intent
      else if (textLower.includes("approved") || textLower.includes("completed")) {
        const response = await getApprovedListByEmpId(empNumber);
        const records = response.data?.records || [];
        addMessage(
          "bot",
          `Found ${records.length} approved request(s) in your history.`,
          { cards: records.slice(0, 3) }
        );
      }
      // 4. Rejected Intent
      else if (textLower.includes("reject")) {
        const response = await getRejectedListByEmpId(empNumber);
        const records = response.data?.records || [];
        addMessage(
          "bot",
          `Found ${records.length} rejected request(s) in your records.`,
          { cards: records.slice(0, 3) }
        );
      }
      // 5. Create Request Navigation
      else if (textLower.includes("create") || textLower.includes("new")) {
        addMessage("bot", "Redirecting you to the New Request Creation Form...");
        setTimeout(() => navigate("/create"), 1000);
      }
      // 6. Direct Lookup / Search Intent
      else if (
        textLower.includes("search") ||
        textLower.includes("axis/") ||
        textLower.includes("find")
      ) {
        const keyword = userText.replace(/search|find|lookup/gi, "").trim();
        const filterType = keyword.startsWith("axis/") ? "oasnumber" : "subject";

        const response = await advancedSearch({
          filterp: filterType,
          filterconditionp: keyword,
          fromdate: "2026/01/01",
          todate: "2026/12/31",
          loginuser: empNumber,
        });

        const records = response.data?.records || [];
        if (records.length === 0) {
          addMessage("bot", `No matching records found for "${keyword}".`);
        } else {
          addMessage("bot", `Found ${records.length} matching search result(s):`, {
            cards: records.slice(0, 3),
          });
        }
      }
      // Fallback
      else {
        addMessage(
          "bot",
          "I didn't quite catch that. You can ask me about pending tasks, request metrics, or search by reference number.",
          {
            chips: [
              "Show Pending Requests",
              "Summary Metrics",
              "Create New Request",
            ],
          }
        );
      }
    } catch (error) {
      console.error("Chatbot processing error:", error);
      addMessage("bot", "Sorry, I encountered an issue executing your request.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    addMessage("user", userText);
    processIntent(userText);
  };

  const handleChipClick = (chipText) => {
    addMessage("user", chipText);
    processIntent(chipText);
  };

  return (
    <div className="chat-widget-container">
      {/* Floating Toggle Button */}
      <button
        type="button"
        className="chat-toggle-btn"
        onClick={toggleWidget}
        title="OAS AI Copilot"
      >
        {isOpen ? "✕" : "💬 AI Copilot"}
      </button>

      {/* Collapsible Drawer */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-title">
              <span className="copilot-icon">🤖</span>
              <div>
                <h4>OAS Assistant</h4>
                <span className="copilot-status">Online • Enterprise Bot</span>
              </div>
            </div>
            <button
              type="button"
              className="chat-close-btn"
              onClick={toggleWidget}
            >
              ✕
            </button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender}`}>
                <div className={`message-bubble ${msg.sender}`}>
                  <p>{msg.text}</p>

                  {/* Summary Metric Cards */}
                  {msg.metrics && (
                    <div className="chat-metrics-grid">
                      <div className="metric-chip pending">
                        <span>Pending</span>
                        <strong>{msg.metrics.Pending}</strong>
                      </div>
                      <div className="metric-chip approved">
                        <span>Approved</span>
                        <strong>{msg.metrics.Approved}</strong>
                      </div>
                      <div className="metric-chip rejected">
                        <span>Rejected</span>
                        <strong>{msg.metrics.Rejected}</strong>
                      </div>
                    </div>
                  )}

                  {/* Request Cards */}
                  {msg.cards && (
                    <div className="chat-cards-list">
                      {msg.cards.map((item) => (
                        <div
                          key={item.Id}
                          className="chat-card-item"
                          onClick={() => handleNavigateToView(item.Id)}
                        >
                          <span className="card-ref">{item.axisrequestid}</span>
                          <span className="card-sub">{item.subject}</span>
                          <span className="card-initiator">
                            By: {item.initiatorname || "System User"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Chips */}
                  {msg.chips && (
                    <div className="chat-chips-container">
                      {msg.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          className="chat-chip-btn"
                          onClick={() => handleChipClick(chip)}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row bot">
                <div className="message-bubble bot loading-bubble">
                  Processing backend query...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="chat-footer">
            <input
              type="text"
              placeholder="Ask about requests, status..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}