# How to install project

npm install
or
npm i

both commands are same. in case you face dependcy issues than run this command

npm install --legacy-peer-deps
or
npm install --force

# How to run project

npm run start

it will open project automatically in browser or show you url like http://localhost:3000/


# Overview
1. In this project, we opted to develop using class components instead of functional components because we were converting existing JavaScript code to ReactJS. Class components provide a familiar and straightforward way to structure the code, especially when migrating from traditional JavaScript to ReactJs.

2. We avoid using setState in the camera and video classes to prevent any potential performance or re-rendering issues. That's why we opted to use React.createRef() instead.

3. No UI package is used for responsivness

4. requestAnimationFrame is used in camera and video canvas rendering instead of setInterval

5. Ace editor is used

6. To link backend just udate its url in .env file and re-run your project by running npm run start

7. Class-level documentation is provided in each class.