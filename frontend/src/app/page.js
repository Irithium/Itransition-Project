import React, { useEffect, useState } from "react";
import axios from "axios";

const Page = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchTemplates = async () => {
  //     try {
  //       const response = await axios.get("/api/templates");
  //       setTemplates(response.data.templates);
  //       setLoading(false);
  //     } catch (error) {
  //       setError(error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchTemplates();
  // }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Templates</h1>
      {/* <ul>
        {templates.map((template) => (
          <li key={template.id}>
            <h2>{template.title}</h2>
            <p>{template.description}</p>
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default Page;
