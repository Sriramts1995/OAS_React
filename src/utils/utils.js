// src/utils/utils.js

/**
 * Formats a date string into DD/MMM/YYYY format (e.g., "07/Sep/2026")
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const cleanStr = dateStr.replace(" ", "T");
  const date = new Date(cleanStr);
  if (isNaN(date.getTime())) return dateStr.split(" ")[0];
  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Extracts uppercase initials from a full name (e.g., "Sriram There" -> "ST")
 */
export const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};