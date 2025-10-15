export enum ActivityType {
    EVENT_COLLABORATION = "event_collaboration", // همکاری در برگزاری رویداد
    PUBLICATION_CONTRIBUTION = "publication_contribution", // مشارکت در انتشارات
    RESEARCH_PARTICIPATION = "research_participation", // مشارکت در تحقیقات
    COMMITTEE_MEMBERSHIP = "committee_membership", // عضویت در کمیته
    DEPARTMENT_LEADERSHIP = "department_leadership", // رهبری دپارتمان
    TRAINING_DELIVERY = "training_delivery", // ارائه آموزش
    MENTORSHIP = "mentorship", // راهنمایی و مشاوره
    PROJECT_MANAGEMENT = "project_management", // مدیریت پروژه
    VOLUNTEER_WORK = "volunteer_work", // کار داوطلبانه
    INNOVATION_CONTRIBUTION = "innovation_contribution", // مشارکت در نوآوری
    AWARD_RECOGNITION = "award_recognition", // دریافت جایزه
    CONFERENCE_PRESENTATION = "conference_presentation", // ارائه در کنفرانس
    WORKSHOP_ORGANIZATION = "workshop_organization", // سازماندهی کارگاه
    NETWORKING_EVENT = "networking_event", // رویداد شبکه‌سازی
    KNOWLEDGE_SHARING = "knowledge_sharing", // اشتراک دانش
  }

export enum WarningTypeEnum {
    LACK_OF_COLLABORATION = "عدم همکاری",
    FAILURE_TO_ATTEND = "عدم حضور",
    MISCONDUCT = "رفتار نامناسب",
    INCOMPLETE_TASK = "انجام ناقص وظیفه",
    VIOLATION_OF_RULES = "تخلف از قوانین",
    LATE_SUBMISSION = "تاخیر در انجام",
    OTHER = "سایر"
}

export enum ActivityStatusEnum {
  approve = "Approved",
  pending = "Pending",
  reject = "Rejected",
  revoke = "Revoked",
  WARNING = "warning"
}