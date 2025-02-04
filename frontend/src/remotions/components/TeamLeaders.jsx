export const TeamLeaders = ({ data }) => {
  // Safely handle the team details in case something is missing
  const team = data?.teamDetails || {};
  
  // Use optional chaining and fallback arrays to avoid errors
  const opsLeaders = data?.champs?.onBasePlusSlugging?.teamLeaders?.[0]?.leaders || [];
  const eraLeaders = data?.champs?.earnedRunAverage?.teamLeaders?.[0]?.leaders || [];
  const fieldingLeaders = data?.champs?.fieldingPercentage?.teamLeaders?.[0]?.leaders || [];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
      <div className="w-4/5 h-4/5 bg-gray-200 p-6 rounded-xl shadow-lg flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800">
          {team.name} Leaders
        </h1>
        <img
          src={team.logo}
          alt={team.name}
          className="w-20 h-20 my-4"
        />

        <div className="grid grid-cols-3 gap-6 w-full">
          {/* OPS Leaders */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700">OPS Leaders</h2>
            {opsLeaders.map((player) => (
              <div key={player.person.id} className="mt-2 text-center">
                <p className="text-lg font-bold text-gray-900">
                  {player.person.fullName}
                </p>
                <p className="text-gray-600">OPS: {player.value}</p>
              </div>
            ))}
          </div>

          {/* ERA Leaders */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700">ERA Leaders</h2>
            {eraLeaders.map((player) => (
              <div key={player.person.id} className="mt-2 text-center">
                <p className="text-lg font-bold text-gray-900">
                  {player.person.fullName}
                </p>
                <p className="text-gray-600">ERA: {player.value}</p>
              </div>
            ))}
          </div>

          {/* Fielding Leaders */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700">Fielding Leaders</h2>
            {fieldingLeaders.map((player) => (
              <div key={player.person.id} className="mt-2 text-center">
                <p className="text-lg font-bold text-gray-900">
                  {player.person.fullName}
                </p>
                <p className="text-gray-600">Fielding %: {player.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
