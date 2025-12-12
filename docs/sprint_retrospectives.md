# Sprint 1 Retrospective – Planning & Setup

---

## What Went Well
- **Strong Team Coordination:** Everyone contributed early and communicated effectively on GitLab, helping to divide tasks clearly and stay on schedule.  
- **All Sprint Goals Achieved:** Every planned issue (Use Cases, Domain Model, React Setup, Database Seeding, and User Stories) was completed before the sprint deadline.  
- **Efficient GitLab Workflow:** The issue board was well-maintained with live updates, priority labels, and severity tags — satisfying the “live, groomed board” rubric requirement.  
- **Smooth Technical Setup:** Both the React frontend and FastAPI backend environments were successfully initialized, providing a solid foundation for development in Sprint 2.  
- **Clear Documentation:** Key project files (`docs/charter.md`, `docs/user_stories.md`, `docs/use_cases.md`, and `docs/domain_model.md`) were finalized early and version-controlled.

---

## What Can Be Improved
- **Earlier Task Assignment:** Some initial confusion around issue ownership slowed early progress. In future sprints, tasks should be assigned immediately during sprint planning.    
- **More Frequent Check-Ins:** Only one or two check-ins occurred midweek; increasing stand-up frequency to daily or every other day will help identify blockers earlier.

---

## Team Velocity

| **Metric** | **Value** | **Notes** |
|-------------|-----------|-----------|
| Total Planned Issues | 5 | Database Seeding, Use Cases, Domain Model, React Setup, User Stories |
| Total Completed Issues | 5 | 100% completion rate |
| Velocity (Completed / Planned) | **5 / 5 = 100%** | Strong first sprint performance |
| Estimated Story Points | ~3 per issue | ≈15 total story points delivered |

**Sprint 1 Velocity:** **≈15 story points completed**

---

## Summary
Sprint 1 was a strong start for the UWDialed team.  
All deliverables were completed on time, the development environments were properly configured, and foundational project documents were finalized. The team demonstrated excellent collaboration and organization throughout the sprint.

---

# Sprint 2 Retrospective

## What Went Well
* **Mapbox Integration:** We successfully integrated the Mapbox API into the frontend, achieving a critical visual objective.
* **Data & Geolocation:** Solved the missing coordinate issue by performing a schema migration and mapping all 25 study spots with precise latitude/longitude.
* **Frontend Progress:** The homepage structure is implemented, moving the project from backend logic to a visible product.

## What Can Be Improved
* **Clarify Task Ownership Early:** We experienced some initial ambiguity regarding ownership of specific backend vs. frontend tasks, which delayed the start of work. In future sprints, we must assign specific owners to every issue immediately during Sprint Planning.
* **Increase Stand-up Frequency:** This was not improved much from last week. Increasing our stand-up frequency to daily or every other day will help us identify blockers early.

## Team Velocity

| **Metric** | **Value** | **Notes** |
|-------------|-----------|-----------|
| Total Planned Issues | 3 | Database Seeding, Mapbox Integration, Homepage Setup |
| Total Completed Issues | 3 | 100% completion rate |
| Velocity (Completed / Planned) | **3 / 3 = 100%** | Cleared blockers for Mapbox & Geolocation |
| Estimated Story Points | ~5 per issue | ≈15 total story points delivered |

**Sprint 2 Velocity:** **≈15 story points completed**

## Summary
Sprint 2 was a success in terms of technical integration. We bridged the gap between the database and the 
frontend map, ensuring the application now displays accurate, real-world data. The focus for the next sprint should be maintaining this momentum while enforcing stricter data management practices to avoid future debt.

# 🌀 Sprint 3 Retrospective – Feature Integration & UI Improvements

## 🗓️ Sprint Duration
**Week 3 – Focus:** Implementing recommendation logic, improving UI navigation, and enhancing the presentation of study spot data.

---

## ✅ What Went Well
- **Core User-Facing Features Delivered:**  
  The AI Survey Spot Recommender was successfully implemented, enabling the system to generate personalized study spot suggestions based on user input. This was a major feature and adds real value to the app.

- **Improved Navigation & Usability:**  
  The "Home" button was added to the Map page, significantly improving navigation and making it easier for users to return to the main interface.

- **Enhanced Visual Assets:**  
  All required images for study spots were added to the `public` folder, enabling a richer UI and improving the future dashboard experience.

- **Stable Collaboration Workflow:**  
  Issues were consistently updated on GitLab, and completed tasks were closed promptly. The team continues to maintain strong commit hygiene and good visibility into progress.

---

## 🧭 What Can Be Improved
- **Carry-Over Tasks Need Earlier Start:**  
  Two tasks — the Study Spot Dashboard and the Final README Docs — did not get completed. Both were larger tasks than initially estimated and should have been broken into smaller sub-issues or begun earlier in the sprint.

- **Scope Sizing & Story Breakdown:**  
  The dashboard feature was too broad for a single sprint-sized issue. Breaking it into:  
  - UI layout  
  - API integration  
  - Spot cards  
  - Filtering logic  
  would make it more realistic to complete.

- **Documentation Lag:**  
  README work was postponed repeatedly. Moving documentation tasks earlier in the sprint or assigning a dedicated owner would help avoid spillover.

- **More Frequent Check-Ins:**  
  A mid-sprint review could have identified that dashboard progress was slowing, allowing for reallocation of effort.

---

## ⚙️ Team Velocity

| **Metric** | **Value** | **Notes** |
|------------|-----------|-----------|
| Total Planned Issues | 5 | Dashboard, Final README Docs, Recommender, Home Button, Images |
| Completed Issues | 3 | Recommender, Home Button, Images |
| Velocity (Completed / Planned) | **3 / 5 = 60%** | Slight reduction due to two large incomplete items |
| Estimated Story Points | ~3 per issue | ≈15 planned → **9 completed** |

**Sprint 3 Velocity:** **≈9 story points completed**

---

## 🧩 Summary
Sprint 3 delivered several important user-facing features, including the AI recommender and significant UI enhancements. While the team made meaningful progress, two major tasks were not completed and will need to carry over into Sprint 4.

The team should focus next sprint on:
- completing the Study Spot Dashboard,  
- finishing the final README structure, and  
- breaking down large issues into smaller, sprint-sized tasks.

Overall, the sprint demonstrated solid execution on core features with clear areas to refine planning and task sizing moving forward.

# 🌀 Sprint 4 Retrospective – UI Enhancements & Final Documentation Prep

## 🗓️ Sprint Duration
**Week 4 – Focus:** Refining frontend experience, integrating key UI enhancements, and preparing documentation for final submission.

---

## ✅ What Went Well

- **All Sprint Tasks Completed:**  
  Every planned issue for Sprint 4 was finished on time, showing strong coordination and clear task ownership. This includes UI enhancements, polishing user flow, and initializing the final README structure.

- **Significant Frontend Improvements:**  
  The expandable Study Spot modal, card-by-card survey UI flow, and improved navigation (Dashboard + Recommended Spots) noticeably strengthened the user experience.

- **Review System Successfully Integrated:**  
  The new review system provides additional interaction and enhances the utility of the study spot information, increasing engagement and usability.

- **Clean & Cohesive UI:**  
  Design consistency improved this sprint. The footer addition, refined navigation, and interactive modal all contribute to a polished product ready for the final demo.

- **Documentation Progress:**  
  The Final README Docs were started and structured, laying the groundwork for a high-quality final submission.

- **Excellent Team Execution:**  
  Communication, issue tracking, and GitLab hygiene were strong. Issues were updated regularly and closed promptly.

---

## 🧭 What Can Be Improved

- **Start Documentation Earlier:**  
  Although the README was completed, documentation tasks continue to be left toward the end of a sprint. Starting them earlier would reduce last-minute load.

- **More Granular Issue Breakdown:**  
  Some Sprint 4 tasks (e.g., expandable modal + review integration) were broad and included multiple steps. Breaking them into smaller issues would improve estimation accuracy and clarity.

- **More Frequent Check-Ins on UI Work:**  
  With many UI-heavy tasks, more mid-sprint communication could help align design decisions earlier rather than during implementation.

- **Testing Coverage:**  
  Manual testing improved, but automated test coverage did not progress during this sprint and should be prioritized in Sprint 5 to meet the 70% requirement.

---

## ⚙️ Team Velocity

| **Metric** | **Value** | **Notes** |
|------------|-----------|-----------|
| Total Planned Issues | 6 | All issues shown in Sprint 4 board |
| Completed Issues | 6 | 100% completion |
| Velocity (Completed / Planned) | **6 / 6 = 100%** | Strong execution for this sprint |
| Estimated Story Points | ~3 per issue | ≈18 total story points completed |

**Sprint 4 Velocity:** **≈18 story points completed**

---

## 🧩 Summary

Sprint 4 was a highly productive sprint focused on user-interface polish, improved navigation, and front-end interactivity. All planned tasks were completed, and the app now feels significantly more cohesive and user-friendly.

The team has demonstrated strong alignment, steady velocity, and consistent improvement across sprints. The product is well-positioned for the final sprint, where the focus will shift to:

- completing the README,  
- improving testing coverage,  
- final UI refinements,  
- preparing for the video demo, and  
- final deployment polishing.

Overall, Sprint 4 delivered exactly what the project needed at this stage and keeps the team ahead of schedule for a high-quality final submission.
