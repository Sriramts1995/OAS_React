// src/utils/payloadBuilder.js
import { REQUEST_STATUS, MEMO_TYPES } from "./constants";

/**
 * Construct JSON payload for new request submission
 */
export const buildSubmitPayload = ({
  subject,
  details,
  remarks,
  approvers,
  userInfo = {},
}) => {
  const currentDate = new Date().toISOString().replace("Z", "");
  const initiatorId = userInfo.EMPLOYEE_NUMBER;
  const initiatorName = userInfo.Display_Name;
  const initiatorDept = userInfo.Department;

  const dynamicApproversPayload = approvers.map((app, idx) => ({
    approvarid: app.empId,
    approvarname: app.empName,
    approvardeptid: null,
    approvardeptname: app.department,
    status: REQUEST_STATUS.PENDING,
    sequence: idx + 1,
    isskipped: 0,
    assigneddate: null,
    completiondate: null,
    requestid: null,
    Grade_Code: app.gradeCode || "AM",
    email: app.email || "",
    updatedat: null,
    createdat: currentDate,
  }));

  const fullApproverList = [
    {
      approvarid: initiatorId,
      approvarname: initiatorName,
      approvardeptid: null,
      approvardeptname: initiatorDept,
      status: REQUEST_STATUS.INITIATED_SEQUENCE,
      sequence: 0,
      isskipped: 0,
      assigneddate: null,
      completiondate: null,
      requestid: null,
      createdat: currentDate,
      updatedat: null,
      email: userInfo.EMAIL_ADDRESS || "",
    },
    ...dynamicApproversPayload,
  ];

  return {
    initiatorid: initiatorId,
    initiatorname: initiatorName,
    initiatordept: initiatorDept,
    ip: "1.1.1.1",
    history: [
      {
        fromid: initiatorId,
        fromname: initiatorName,
        toid: null,
        toname: null,
        fromstatus: 0,
        tostatus: null,
        requestid: null,
        remarks: remarks || "Initiated request",
        ip: "1.1.1.1",
        createdat: currentDate,
        updatedat: currentDate,
      },
    ],
    memotypeid: 1,
    submemotypeid: 1,
    memoname: MEMO_TYPES.NON_FINANCIAL,
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
    currentuserstatus: REQUEST_STATUS.PENDING,
    status: REQUEST_STATUS.PENDING,
    createdat: currentDate,
    updatedat: currentDate,
    assigneddate: currentDate,
    overallcompletiondate: null,
    approvar: fullApproverList,
    attachment: [],
    currentuser: approvers[0].empId,
    currentusername: approvers[0].empName,
    fyi: [],
    email: {},
  };
};

/**
 * Constructs Volt MX JSON payload for Approve / Reject action
 */
export const buildWorkflowPayload = ({
  record,
  statusCode, // 4 for Approved, 5 for Rejected
  approverRemarks,
  empNumber,
  currentUserName,
}) => {
  const now = new Date().toISOString().replace("Z", "");

  const updatedApprovar = (record.approvar || []).map((app, index) => {
    if (index === 1 || app.approvarid === empNumber) {
      return {
        ...app,
        status: statusCode,
        updatedat: now,
      };
    }
    return app;
  });

  const newHistoryEntry = {
    fromid: empNumber,
    fromname: currentUserName,
    fromstatus: statusCode,
    toid: null,
    toname: null,
    tostatus: null,
    remarks: approverRemarks || (statusCode === REQUEST_STATUS.APPROVED ? "Approved" : "Rejected"),
    ip: "1.1.1.1",
    createdat: now,
    updatedat: now,
    requestid: record.Id,
  };

  return {
    ...record,
    status: statusCode,
    currentuserstatus: statusCode,
    updatedat: now,
    assigneddate: now,
    currentuser: empNumber,
    currentusername: currentUserName,
    approvar: updatedApprovar,
    history: [...(record.history || []), newHistoryEntry],
    attachment: [],
    fyi: [],
    email: {},
  };
};