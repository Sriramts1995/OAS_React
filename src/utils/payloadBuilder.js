// src/utils/payloadBuilder.js
import { REQUEST_STATUS, MEMO_TYPES } from "./constants";

/**
 * Helper to construct dynamic email objects matching Volt MX emailobject.js logic
 */
const buildDynamicEmailObject = ({
  event, // "create", "approved", "lastapproved", "rejected", "sendback"
  subject,
  axisrequestid = "",
  approvarList = [],
  initiatorEmail = "",
  actingUserName = "",
}) => {
  // Find initiator email from sequence 0 if not provided
  const initiatorEntry = approvarList.find((a) => a.sequence === 0);
  const targetInitiatorEmail = initiatorEmail || initiatorEntry?.email || "";

  let to = "";
  let cc = "";
  let emailSubject = "";
  let contexttext = "";
  let emailStatus = REQUEST_STATUS.PENDING;

  // 1. CREATE / RESUBMIT
  if (event === "create") {
    const firstApprover = approvarList.find((a) => a.sequence === 1) || {};
    to = firstApprover.email || "";
    cc = targetInitiatorEmail;
    emailSubject = `OAS Submitted: ${subject}`;
    emailStatus = REQUEST_STATUS.PENDING;
    contexttext = "You are required to take action in the Online Approval System.";
  }
  // 2. INTERMEDIATE APPROVER APPROVED
  else if (event === "approved") {
    const nextPending = approvarList.find((a) => a.sequence > 0 && a.status === REQUEST_STATUS.PENDING) || {};
    to = nextPending.email || "";
    cc = targetInitiatorEmail;
    emailSubject = `OAS Pending: ${subject}`;
    emailStatus = REQUEST_STATUS.PENDING;
    contexttext = "You are required to take action in the Online Approval System.";
  }
  // 3. FINAL APPROVER APPROVED
  else if (event === "lastapproved") {
    to = targetInitiatorEmail;
    // Group all sequence > 0 approver emails
    const approverEmails = approvarList
      .filter((a) => a.sequence > 0 && a.email)
      .map((a) => a.email);
    cc = [...new Set(approverEmails)].join(",");
    emailSubject = `OAS Approved: ${subject}`;
    emailStatus = REQUEST_STATUS.APPROVED;
    contexttext = `Reference No ${axisrequestid} is approved and closed.`;
  }
  // 4. REJECTED
  else if (event === "rejected") {
    to = targetInitiatorEmail;
    // Group emails of approvers who took action (approved or rejected)
    const processedEmails = approvarList
      .filter(
        (a) =>
          a.sequence > 0 &&
          (a.status === REQUEST_STATUS.APPROVED || a.status === REQUEST_STATUS.REJECTED) &&
          a.email
      )
      .map((a) => a.email);
    cc = [...new Set(processedEmails)].join(",");
    emailSubject = `OAS Rejected: ${subject}`;
    emailStatus = REQUEST_STATUS.REJECTED;
    contexttext = `Reference No ${axisrequestid} is rejected by ${actingUserName}`;
  }
  // 5. SEND BACK
  else if (event === "sendback") {
    to = targetInitiatorEmail;
    // Group emails of sendback approvers (or acting approver)
    const sendbackEmails = approvarList
      .filter((a) => a.sequence > 0 && a.status === REQUEST_STATUS.SEND_BACK && a.email)
      .map((a) => a.email);
    cc = sendbackEmails.length > 0 ? [...new Set(sendbackEmails)].join(",") : "";
    emailSubject = `OAS sent to initiator: ${subject}`;
    emailStatus = REQUEST_STATUS.SEND_BACK;
    contexttext = `Reference No ${axisrequestid} is sent back to you by ${actingUserName}`;
  }

  return {
    to,
    cc,
    subject: emailSubject,
    memotype: MEMO_TYPES.NON_FINANCIAL,
    status: emailStatus,
    contexttext,
    flowtype: "",
  };
};

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

  // First approver (Sequence 1) gets status = 1 (Pending), subsequent approvers get status = 0
  const dynamicApproversPayload = approvers.map((app, idx) => ({
    approvarid: app.empId,
    approvarname: app.empName,
    approvardeptid: null,
    approvardeptname: app.department,
    status: idx === 0 ? REQUEST_STATUS.PENDING : 0, // Sequence 1: 1, Sequence 2+: 0
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

  // Dynamic email object for creation
  const emailPayload = buildDynamicEmailObject({
    event: "create",
    subject,
    approvarList: fullApproverList,
    initiatorEmail: userInfo.EMAIL_ADDRESS || "",
  });

  return {
    initiatorid: initiatorId,
    initiatorname: initiatorName,
    initiatordept: initiatorDept,
    ip: "1.1.1.1",
    /*
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
    */
    history: [], // History kept empty on creation
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
    email: emailPayload,
  };
};

/**
 * Constructs Volt MX JSON payload for Approve / Reject / Send Back action
 */
export const buildWorkflowPayload = ({
  record,
  statusCode, // 4 for Approved, 5 for Rejected, 3 for Send Back
  approverRemarks,
  empNumber,
  currentUserName,
}) => {
  const now = new Date().toISOString().replace("Z", "");
  const approverList = record.approvar || [];

  // Find index of the currently acting approver in the sequence
  const currentApproverIndex = approverList.findIndex(
    (app) => app.approvarid === empNumber && app.sequence > 0
  );

  const activeIndex = currentApproverIndex !== -1 ? currentApproverIndex : 1;

  let nextCurrentUser = empNumber;
  let nextCurrentUserName = currentUserName;
  let nextCurrentUserStatus = statusCode;
  let overallRequestStatus = statusCode;
  let updatedApprovar = [];
  let emailEvent = "approved";

  // 1. SEND BACK FLOW (statusCode === 3)
  if (statusCode === REQUEST_STATUS.SEND_BACK) {
    emailEvent = "sendback";
    nextCurrentUser = record.initiatorid;
    nextCurrentUserName = record.initiatorname;
    nextCurrentUserStatus = REQUEST_STATUS.SEND_BACK; // 3
    overallRequestStatus = REQUEST_STATUS.SEND_BACK; // 3

    // Sequence 0: Preserve exact existing record and update status to 3
    const initiatorEntry = approverList.find((app) => app.sequence === 0);
    const updatedInitiator = initiatorEntry
      ? { ...initiatorEntry, status: REQUEST_STATUS.SEND_BACK, updatedat: now }
      : {
          approvarid: record.initiatorid,
          approvarname: record.initiatorname,
          approvardeptname: record.initiatordept,
          sequence: 0,
          status: REQUEST_STATUS.SEND_BACK,
          updatedat: now,
        };

    // Extract original dynamic approvers (sequence > 0)
    const originalLineup = approverList.filter((app) => app.sequence > 0);

    // Processed approvers up to active index get sequence: -1, isskipped: 1
    const skippedApprovers = originalLineup.slice(0, activeIndex + 1).map((app, idx) => ({
      ...app,
      sequence: -1,
      isskipped: 1,
      status: idx === activeIndex ? REQUEST_STATUS.SEND_BACK : app.status,
      updatedat: now,
    }));

    // Duplicate clean line-up starting fresh from sequence 1 with status 0
    const freshLineup = originalLineup.map((app, idx) => {
      const { Id, ...cleanApp } = app;
      return {
        ...cleanApp,
        sequence: idx + 1,
        isskipped: 0,
        status: 0,
        updatedat: now,
      };
    });

    updatedApprovar = [updatedInitiator, ...skippedApprovers, ...freshLineup];
  } 
  // 2. REJECT FLOW
  else if (statusCode === REQUEST_STATUS.REJECTED) {
    emailEvent = "rejected";
    updatedApprovar = approverList.map((app, index) => {
      if (index === activeIndex) {
        return {
          ...app,
          status: statusCode,
          updatedat: now,
        };
      }
      return app;
    });
  }
  // 3. APPROVE FLOW
  else {
    updatedApprovar = approverList.map((app, index) => {
      if (index === activeIndex) {
        return {
          ...app,
          status: statusCode,
          updatedat: now,
        };
      }
      return app;
    });

    const nextApproverIndex = activeIndex + 1;
    if (nextApproverIndex < approverList.length) {
      // Transition next approver status from 0 to 1 (Pending)
      emailEvent = "approved";
      const nextApprover = approverList[nextApproverIndex];
      updatedApprovar[nextApproverIndex] = {
        ...nextApprover,
        status: REQUEST_STATUS.PENDING, // 1
        updatedat: now,
      };
      nextCurrentUser = nextApprover.approvarid;
      nextCurrentUserName = nextApprover.approvarname;
      nextCurrentUserStatus = REQUEST_STATUS.PENDING; // 1
      overallRequestStatus = REQUEST_STATUS.PENDING; // 1
    } else {
      // Final approver in line approved -> overall request closed & approved
      emailEvent = "lastapproved";
      overallRequestStatus = REQUEST_STATUS.APPROVED; // 4
      nextCurrentUserStatus = REQUEST_STATUS.APPROVED; // 4
    }
  }

  // Construct dynamic email payload
  const emailPayload = buildDynamicEmailObject({
    event: emailEvent,
    subject: record.subject,
    axisrequestid: record.axisrequestid,
    approvarList: updatedApprovar,
    actingUserName: currentUserName,
  });

  // Construct new history entry for approver action
  const newHistoryEntry = {
    fromid: empNumber,
    fromname: currentUserName,
    fromstatus: statusCode,
    toid: statusCode === REQUEST_STATUS.SEND_BACK ? record.initiatorid : null,
    toname: statusCode === REQUEST_STATUS.SEND_BACK ? record.initiatorname : null,
    tostatus: statusCode === REQUEST_STATUS.SEND_BACK ? 0 : null,
    remarks: approverRemarks || (statusCode === REQUEST_STATUS.APPROVED ? "Approved" : statusCode === REQUEST_STATUS.SEND_BACK ? "sb" : "Rejected"),
    ip: "1.1.1.1",
    createdat: now,
    updatedat: now,
    requestid: record.Id,
  };

  return {
    ...record,
    status: overallRequestStatus,
    currentuserstatus: nextCurrentUserStatus,
    updatedat: now,
    assigneddate: now,
    currentuser: nextCurrentUser,
    currentusername: nextCurrentUserName,
    approvar: updatedApprovar,
    history: [...(record.history || []), newHistoryEntry], // Appending action entry into history
    attachment: [],
    fyi: [],
    email: emailPayload,
  };
};

/**
 * Constructs Volt MX JSON payload when Initiator resubmits a Sent Back request
 */
export const buildResubmitPayload = ({
  record,
  subject,
  details,
  remarks,
  empNumber,
  currentUserName,
}) => {
  const now = new Date().toISOString().replace("Z", "");
  const approverList = record.approvar || [];

  // Filter out skipped (-1 sequence) records to retain active clean line-up
  const cleanLineup = approverList.filter((app) => app.sequence >= 0);

  // Update line-up: sequence 0 gets status 20, sequence 1 gets status 1 (Pending), rest get status 0
  const updatedApprovar = cleanLineup.map((app) => {
    if (app.sequence === 0) {
      return { ...app, status: REQUEST_STATUS.INITIATED_SEQUENCE, updatedat: now }; // 20
    }
    if (app.sequence === 1) {
      return { ...app, status: REQUEST_STATUS.PENDING, updatedat: now }; // 1
    }
    return { ...app, status: 0, updatedat: now };
  });

  const firstApprover = updatedApprovar.find((app) => app.sequence === 1) || {};

  // Update Base64 description in requestdetails
  const updatedRequestDetails = (record.requestdetails || []).map((det, idx) => {
    if (idx === 0) {
      return {
        ...det,
        description: btoa(unescape(encodeURIComponent(details))),
        updatedat: now,
      };
    }
    return det;
  });

  // Dynamic email payload for resubmission
  const emailPayload = buildDynamicEmailObject({
    event: "create",
    subject: subject,
    axisrequestid: record.axisrequestid,
    approvarList: updatedApprovar,
  });

  // Construct history entry for resubmission
  const newHistoryEntry = {
    fromid: empNumber,
    fromname: currentUserName,
    fromstatus: 0,
    toid: null,
    toname: null,
    tostatus: null,
    remarks: remarks || "",
    ip: "1.1.1.1",
    createdat: now,
    updatedat: now,
    requestid: record.Id,
  };

  return {
    ...record,
    subject: subject,
    initiatorremarks: remarks,
    status: REQUEST_STATUS.PENDING, // 1
    currentuserstatus: REQUEST_STATUS.PENDING, // 1
    currentuser: firstApprover.approvarid || record.currentuser,
    currentusername: firstApprover.approvarname || record.currentusername,
    updatedat: now,
    assigneddate: now,
    approvar: updatedApprovar,
    requestdetails: updatedRequestDetails,
    history: [...(record.history || []), newHistoryEntry],
    attachment: [],
    fyi: [],
    email: emailPayload,
  };
};