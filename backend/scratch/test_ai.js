import { askAIChatbot } from '../controllers/aiController.js';

const testAI = async () => {
  const req = {
    body: {
      message: 'what is react and how to use state?',
      courseName: 'MERN Stack Mastery',
      lessonTitle: 'React Fundamentals'
    }
  };

  const res = {
    json: (data) => {
      console.log('AI Response Test Passed!');
      console.log(data.reply);
      process.exit(0);
    },
    status: (code) => ({
      json: (data) => {
        console.error('Error Code:', code, data);
        process.exit(1);
      }
    })
  };

  await askAIChatbot(req, res);
};

testAI();
