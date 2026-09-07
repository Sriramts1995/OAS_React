// src/utils/validation.js
import { UI_LIMITS } from "./constants";

/**
 * Validates the Create Request form payload before submission
 */
export const validateCreateForm = ({ subject, details, approvers }) => {
  if (!subject || !subject.trim()) {
    return { isValid: false, message: "Subject Line is required." };
  }

  if (subject.length > UI_LIMITS.SUBJECT_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Subject Line cannot exceed ${UI_LIMITS.SUBJECT_MAX_LENGTH} characters.`,
    };
  }

  if (!details || !details.trim()) {
    return { isValid: false, message: "Details field cannot be empty." };
  }

  if (!approvers || approvers.length === 0) {
    return { isValid: false, message: "At least one approver must be selected." };
  }

  const hasInvalidApprover = approvers.some(
    (app) => !app.empId || !app.empId.trim() || !app.empName || !app.empName.trim()
  );

  if (hasInvalidApprover) {
    return {
      isValid: false,
      message: "Please enter and verify a valid Employee ID for all added approver rows.",
    };
  }

  return { isValid: true, message: "" };
};
