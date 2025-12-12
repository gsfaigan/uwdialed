# UWDialed Use-Case Models

The Use-Case Model defines the functional requirements of the UWDialed system from the user's perspective.

---

## Core User Use Cases (Student Focus)

### Use Case: Get Personalized Recommendations (UC-01)

| Element            | Description                                                                                                                                                                                                                       |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actor**          | Student/User                                                                                                                                                                                                                      |
| **Goal**           | Receive personalized study spot recommendations across campus.                                                                                                                                                                    |
| **Preconditions**  | User loads the website. Study spot data is available in the database.                                                                                                                                                             |
| **Main Flow**      | 1. User loads the website. 2. User puts in their preferences via a quick survey. 3. System processes input against live predicted data (busyness, noise level, food, etc.). 4. System presents a list of recommended study spots. |
| **Postconditions** | A recommended study spot is provided.                                                                                                                                                                                             |
| **Exceptions**     | **No Spots Match:** System returns a message indicating no spots match the current criteria.                                                                                                                                      |

---

### Use Case: View Study Spots on Map (UC-02)

| Element            | Description                                                                                                                                                                                              |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actor**          | Student/User                                                                                                                                                                                             |
| **Goal**           | Easily find recommended study spots using an interactive campus map.                                                                                                                                     |
| **Preconditions**  | Mapbox is integrated into the frontend. Study spot location data is available.                                                                                                                           |
| **Main Flow**      | 1. User selects the "View Map" option. 2. System integrates Mapbox and loads the campus map visually. 3. System displays markers for all available study spots. 4. User views the location of each spot. |
| **Postconditions** | Study spot locations are displayed visually on the map.                                                                                                                                                  |
| **Exceptions**     | **Map API Failure:** System displays an error message indicating that the map cannot be loaded.                                                                                                          |

---

### Use Case: Filter Study Spots (UC-03)

| Element            | Description                                                                                                                                                                                                                                                                     |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Actor**          | Student/User                                                                                                                                                                                                                                                                    |
| **Goal**           | Choose an environment that matches the study style by filtering by noise level and finding a quieter space during peak hours by filtering by busyness level.                                                                                                                    |
| **Preconditions**  | A list of study spots is displayed on the screen.                                                                                                                                                                                                                               |
| **Main Flow**      | 1. User interacts with a filter control (e.g., dropdown, slider). 2. User selects a filter criteria (e.g., "Noise: Low," or "Busyness: Low"). 3. System sends the filter request to the backend. 4. System updates the displayed list to show only spots matching the criteria. |
| **Postconditions** | The displayed list of study spots is reduced based on the selected filter criteria.                                                                                                                                                                                             |
| **Exceptions**     | **Filter Returns No Results:** The system displays a message indicating that no spots match the current filter selection.                                                                                                                                                       |

---

### Use Case: Manage Favorite Spots (UC-04)

| Element            | Description                                                                                                                                                                                                                     |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Actor**          | Student/User                                                                                                                                                                                                                    |
| **Goal**           | Mark a study spot as a favorite so that the user can return to it later.                                                                                                                                                        |
| **Preconditions**  | The user is viewing a study spot's details.                                                                                                                                                                                     |
| **Main Flow**      | 1. User selects the "Favorite" option next to a study spot. 2. System records the spot ID as a favorite linked to the user's profile. 3. System displays confirmation. 4. User can access a list of only their favorited spots. |
| **Postconditions** | The study spot is saved as a user favorite.                                                                                                                                                                                     |
| **Exceptions**     | **Save Failure:** System fails to record the spot due to a database error.                                                                                                                                                      |
