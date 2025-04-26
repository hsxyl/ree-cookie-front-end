// import { cookieActor } from "@/canister/cookie/actor";
// import { UNISAT, useLaserEyes } from "@omnisat/lasereyes"
// import { useEffect, useState } from "react";
// import { Skeleton } from "./ui/skeleton";
// import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
// import Typography from '@mui/material/Typography';
// import Box from '@mui/material/Box';
// import { EXCHANGE_ID } from "@/constants";
// import { Register } from "./claim";
// import { useWalletBtcUtxos } from "@/hooks/use-utxos";
// import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
// import { set } from "immer/dist/internal.js";
// import { CheckIcon } from "lucide-react";


// export function Game() {

//     const { address, paymentAddress, connect } = useLaserEyes();
//     const btcUtxos = useWalletBtcUtxos();
//     const [isRegistered, setIsRegistered] = useState<boolean>(false)
//     const [loading, setLoading] = useState<boolean>(true)
//     // const [gameStartTime, setGameStartTime] = useState<bigint>(BigInt(0))
//     // const [gameEndTime, setGameEndTime] = useState<bigint>(BigInt(0))
//     const [lastClaimTime, setLastClaimTime] = useState<bigint>(BigInt(0))
//     const [claimCoolingDown, setClaimCoolingDown] = useState<bigint>(BigInt(0))
//     const [claimedCookies, setClaimedCookies] = useState<bigint>(BigInt(0))
//     const [cookieAmountPerClick, setCookieAmountPerClick] = useState<bigint>(BigInt(0))
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [claimResultSuccess, setClaimResultSuccess] = useState(false);

//     const successAlert = () => <div>
//         <Alert variant="filled" severity="success">
//             {/* <AlertTitle>Success</AlertTitle> */}

//             Claim Success!
//         </Alert>
//     </div>

//     const failedAlert = () => <div>
//         <Alert severity="error">Claim Failed!</Alert>
//     </div>


//     const clickClaim = async () => {
//         // let res = await cookieActor.claim()
//         // console.log(JSON.stringify(res))
//         // if("Ok" in res) {
//         setTimeout(() => {
//             setClaimedCookies(claimedCookies + cookieAmountPerClick)
//             setLastClaimTime(BigInt(Math.floor(Date.now() / 1000)))
//             setClaimResultSuccess(true)
//             setSnackbarOpen(true)

//         }, 1000);

//         // } 
//     }

//     useEffect(() => {

//         (async () => {
//             if (!address) {
//                 return
//             }
//             setLoading(false)
//             const game_and_gamer_infos = await cookieActor.get_game_and_gamer_infos(address)
//             const gamer_opt = game_and_gamer_infos.gamer
//             if (gamer_opt.length === 0) {
//                 setIsRegistered(false)
//             } else {
//                 setIsRegistered(true)
//                 const gamer = gamer_opt[0]!
//                 setLastClaimTime(gamer.last_click_time)
//                 setClaimedCookies(gamer.cookies)
//             }
//             // setGameStartTime(game_and_gamer_infos.game_start_time)
//             // setGameEndTime(game_and_gamer_infos.game_duration + game_and_gamer_infos.game_start_time)
//             setClaimCoolingDown(game_and_gamer_infos.cookie_amount_per_claim)
//             setCookieAmountPerClick(game_and_gamer_infos.cookie_amount_per_claim)
//         })()
//     }, [address])

//     return <div className="flex flex-col items-center justify-center">
//         {/* <GameProgress loading={loading} gameEndTime={gameEndTime} gameStartTime={gameStartTime} /> */}
//         <Snackbar
//             open={snackbarOpen}
//             autoHideDuration={5000}
//             anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         >
//             {claimResultSuccess ? successAlert() : failedAlert()}
//         </Snackbar>
//         <img src="/icon.png" />
//         {address ?
//             !loading ?
//                 (isRegistered ?
//                     <Claim
//                         lastClaimTime={lastClaimTime}
//                         claimCoolingDown={claimCoolingDown}
//                         claimedCookies={claimedCookies}
//                         cookieAmountPerClick={cookieAmountPerClick}
//                         onClaim={clickClaim}
//                     />
//                     :
//                     <Register
//                         paymentAddress={paymentAddress}
//                         paymentAddressUtxos={btcUtxos} />
//                 )
//                 : <Skeleton />
//             :
//             <Button variant="contained" size="large" onClick={() => connect(UNISAT)}>Connect Wallet</Button>
//         }
//     </div>
// }

// function GameProgress({
//     loading,
//     gameStartTime,
//     gameEndTime
// }: {
//     loading: boolean,
//     gameStartTime: bigint,
//     gameEndTime: bigint
// }) {
//     const [progress, setProgress] = useState(0);

//     // let past_time = BigInt(Math.floor(Date.now() / 1000)) - gameStartTime
//     // let percentage = (Date.now() / 1000 - Number(gameStartTime)) / (1 + Number(gameEndTime) - Number(gameStartTime)) * 100
//     // console.log({
//     //     percentage,
//     //     past_time,
//     //     gameStartTime,
//     //     gameEndTime
//     // })

//     useEffect(() => {
//         if (loading || gameStartTime === BigInt(0)) {
//             return
//         }
//         const timer = setInterval(() => {
//             // const percentage = (BigInt(Math.floor(Date.now() / 1000)) - gameStartTime) / (BigInt(1) + gameEndTime - gameStartTime) * BigInt(100)
//             const percentage = (Date.now() / 1000 - Number(gameStartTime)) / (1 + Number(gameEndTime) - Number(gameStartTime)) * 100
//             // const percentage = 100
//             console.log({ percentage })
//             setProgress(percentage)
//         }, 800);
//         return () => {
//             clearInterval(timer);
//         };

//     }, [loading, gameStartTime])

//     return <div>
//         {
//             !loading &&
//             <div>
//                 <LinearProgressWithLabel value={progress} endTime={Number(gameEndTime)} />

//             </div>

//         }
//     </div>
// }

// function Claim({
//     lastClaimTime,
//     claimCoolingDown,
//     claimedCookies,
//     cookieAmountPerClick,
//     onClaim
// }: {
//     lastClaimTime: bigint,
//     claimCoolingDown: bigint,
//     claimedCookies: bigint,
//     cookieAmountPerClick: bigint,
//     onClaim: () => void
// }) {
//     console.log({
//         lastClaimTime,
//         claimCoolingDown,
//         currentTime: Math.floor(Date.now() / 1000)
//     })

//     return <div className="flex flex-col items-center">
//         {claimedCookies >= 0 && <div>{`Claimed Cookies: ${claimedCookies.toString()}`}</div>}
//         {
//             lastClaimTime + claimCoolingDown > BigInt(Math.floor(Date.now() / 1000)) ?
//                 <Button variant="contained" disabled>Cooling Down</Button>
//                 :
//                 <Button variant="contained" onClick={() => {
//                     onClaim()
//                 }}>Claim {cookieAmountPerClick} Cookies</Button>
//         }
//     </div>
// }

// function LinearProgressWithLabel(props: LinearProgressProps & { value: number, endTime: number }) {
//     return (

//         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <Box sx={{ minWidth: 35, margin: 5 }}>
//                 <Typography
//                     variant="h6"
//                     sx={{ color: 'text.secondary' }}
//                 >Game Count Down</Typography>
//             </Box>
//             <Box sx={{ width: '500px', mr: 2 }}>
//                 <LinearProgress variant="determinate" {...props} />
//             </Box>
//             <Box sx={{ minWidth: 35 }}>
//                 <Typography
//                     variant="body2"
//                     sx={{ color: 'text.secondary' }}
//                 >{formatCountdownWithDays(Math.floor(props.endTime - Date.now() / 1000))}</Typography>
//             </Box>
//         </Box>
//     );
// }

// function formatCountdownWithDays(seconds: number) {
//     const days = Math.floor(seconds / 86400);
//     const hours = Math.floor((seconds % 86400) / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;

//     const pad = (num: number) => num.toString().padStart(2, '0');

//     if (days > 0) {
//         return `${days}day ${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
//     } else {
//         return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
//     }
// }