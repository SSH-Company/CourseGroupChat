# CourseGroupChat

Setup Instructions

Install the Expo command line tools  
`npm install --global expo-cli`

Open 2 terminals. One terminal will run the client app, while the other runs the server.  

**In Terminal 1:**  
Change directory into **CourseGroupChat/client**.  
Run `expo start`.  

**In Terminal 2:**
Change directory into **CourseGroupChat/server**.  
Run `npm run start-dev`.  

Use the expo app on your phone to scan the QR code generated in terminal 1. This will cause the app to build and execute on your phone.  
If you want to connect to the backend, make sure to change the **BASE_URL** found under `client/BaseUrl` to your local machine's private IP address.



