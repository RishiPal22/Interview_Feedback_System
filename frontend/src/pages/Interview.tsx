import { useEffect, useState } from 'react';
import { supabase } from '../Client';
import AudioRecorder from '../Components/AudioRecorder';

function Interview() {
  const [userData, setUserData] = useState({ username: '', email: '', userId: '' });

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { user } = session;
        setUserData({
          username: user.user_metadata.username || '',
          email: user.email || '',
          userId: user.id || '',
        });
      }
    }
    fetchUser();
  }, []);

  return (
    <>
      <div>Interview</div>
      {userData.username && <AudioRecorder username={userData.username} email={userData.email} userId={userData.userId} />}
    </>
  );
}

export default Interview;