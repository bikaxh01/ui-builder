import { useAuth } from "@clerk/clerk-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
const Navbar = () => {
  const user = useAuth();
  const isSignedIn = user.isSignedIn;

  return (
    <div className=" backdrop-blur-lg  bg-opacity-0   text-white p-4 z-10  border-b-0  w-screen  absolute h-[4rem] ">
      <div className="flex  items-center justify-end  ">
        <button className=" ">
          {isSignedIn ? (
            <SignedIn>
              <UserButton />
            </SignedIn>
          ) : (
            <SignedOut>
              <SignInButton />
            </SignedOut>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
