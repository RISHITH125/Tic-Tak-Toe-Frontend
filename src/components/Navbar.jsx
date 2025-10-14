
function Navbar({ playerName}) {
    return (
        <nav className="absolute top-0 z-10 backdrop-filter backdrop-blur-lg w-1/2">
            <div className="w-full px-4 py-2 flex justify-end ">
                <span className="text-white font-semibold content-center">{playerName ? playerName : "Guest"}</span>
            </div>
        </nav>
    )
}

export default Navbar