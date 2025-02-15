import { useEffect, useState } from 'react';
import { supabase } from '../Client';
import AudioRecorder from '../Components/AudioRecorder';

function Interview() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUsername(session.user.user_metadata.username);
      }
    }
    fetchUser();
  }, []);

  return (
    <>
      <div>Interview</div>
      {username && <AudioRecorder username={username} />}
    </>
  );
}

export default Interview;