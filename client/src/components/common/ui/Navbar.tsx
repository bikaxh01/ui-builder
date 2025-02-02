import { useAuth } from "@clerk/clerk-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Coins, User } from "lucide-react";
import { useEffect } from "react";
import axios from "axios";
import { BASEURL } from "@/components/landing/Input";
const Navbar = () => {
  const user = useAuth();
  const isSignedIn = user.isSignedIn;
  const availableCredits = localStorage.getItem("user-credit");
  console.log("🚀 ~ Navbar ~ availableCredits:", availableCredits)

  useEffect(() => {
    if (isSignedIn) {
      async function getCredit() {
        try {
          const res = await axios.get(
            `${BASEURL}get-user-credit/${user.userId}`
          );
          localStorage.setItem("user-credit", res.data.data.toString());
        } catch (error) {
          console.log("🚀 ~ getCredit ~ error:", error);
        }
      }

      getCredit();
    }
  }, [user]);

  return (
    <div className=" backdrop-blur-lg  bg-opacity-0   text-white p-4 z-10  border-b-0  w-screen  absolute h-[4rem] ">
      <div className="flex  items-center  justify-between  ">
        <Link to={"/pricing"}>Pricing</Link>

        {isSignedIn ? (
          <SignedIn>
            <div className="  w-40  mt-0 pt-0  flex  justify-between ">
              <Badge variant="default" className=" flex gap-2">
                <Coins /> {availableCredits}
              </Badge>

              <UserButton />
            </div>
          </SignedIn>
        ) : (
          <SignedOut>
            <SignInButton />
          </SignedOut>
        )}
      </div>
    </div>
  );
};

export default Navbar;
