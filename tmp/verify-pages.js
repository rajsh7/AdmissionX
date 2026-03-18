const http = require('http');

const token = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwibmFtZSI6IkFudGlncmF2aXR5IiwiZW1haWwiOiJhbnRpZ3Jhdml0eUBhZG1pc3Npb254LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MzgyODQ2NCwiZXhwIjoxNzczOTE0ODY0fQ.3-vg8wGOMT7Ktt56TBxfGh_AONymamqyLz_pgkEtPqc";

async function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Cookie': `adx_admin=${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function run() {
  try {
    console.log("Checking /admin/forms...");
    const forms = await fetchPage('/admin/forms');
    console.log("Status:", forms.status);
    if (forms.data.includes("General Forms")) {
      console.log("Success: Found 'General Forms' label");
      if (forms.data.includes("John Doe")) {
        console.log("Success: Seed data (John Doe) found on page!");
      } else {
        console.log("Failure: Seed data not found in HTML.");
        // console.log("Data snippet:", forms.data.substring(0, 1000));
      }
    } else {
      console.log("Failure: 'General Forms' label not found");
      // console.log("Data snippet:", forms.data.substring(0, 1000));
    }

  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
