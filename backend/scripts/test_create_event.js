(async()=>{
  try{
    const base = 'http://localhost:5000';
    const email = 'testuser+' + Date.now() + '@example.com';
    const password = 'Test@1234A';

    let r = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword: password })
    });
    let j = await r.json();
    console.log('REGISTER', r.status, JSON.stringify(j));
    const token = j.token;
    if (!token) {
      console.error('No token returned, aborting');
      process.exit(1);
    }

    const tomorrow = new Date(Date.now() + 24*3600*1000);
    const date = tomorrow.toISOString().split('T')[0];
    const time = '09:00';

    const eventBody = {
      title: 'Test Event from agent',
      activity_type: 'Running',
      date,
      time,
      latitude: 33.8869,
      longitude: 9.5375,
      description: 'Automated test',
      max_participants: 10
    };

    r = await fetch(base + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(eventBody)
    });
    j = await r.json();
    console.log('CREATE', r.status, JSON.stringify(j));
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();
