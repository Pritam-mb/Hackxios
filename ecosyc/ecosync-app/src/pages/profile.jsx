import React from 'react';
import BackgroundLayout from '../components/BackgroundLayout';

function Profile() {
  return (
    <BackgroundLayout>
      <div className="p-8 pt-32 min-h-screen">
        <h2 className="text-3xl font-bold mb-4 text-[#1B4332]" style={{ fontFamily: "'Google Sans', sans-serif" }}>User Profile & Dashboard</h2>
        <p className="text-[#4A453E]">User info, eco-impact, and leaderboard will go here.</p>
      </div>
    </BackgroundLayout>
  );
}

export default Profile;
