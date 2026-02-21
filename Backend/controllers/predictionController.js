import axios from 'axios';

// The main function to handle prediction
export const getPrediction = async (req, res) => {
  try {
    const inputData = req.body;
    console.log("⚡ Received prediction request:", inputData);

    // 1. Call the Python AI Microservice (Running on Port 5000)
    // Ensure your python server is running!
    const pythonResponse = await axios.post('http://127.0.0.1:5000/predict', inputData);

    // 2. Send the Python result back to React
    console.log("✅ AI Response received");
    res.status(200).json({
      success: true,
      data: pythonResponse.data
    });

  } catch (error) {
    console.error("❌ AI Service Error:", error.message);
    
    // Check if Python server is down
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: "AI Engine is offline. Please start the Python server."
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};