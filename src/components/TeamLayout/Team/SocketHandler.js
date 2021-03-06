import React, { useState, useEffect } from 'react'
import io from 'socket.io-client';
import { API_URL } from '../../../constants'
export const SOCKET = io(API_URL);

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const Delayed = ({ children, waitBeforeShow = 500 }) => {
    const [isShown, setIsShown] = useState(false);
  
    useEffect(() => {
      let id = setTimeout(() => {
        setIsShown(true);
      }, waitBeforeShow);
      return ()=> { clearTimeout(id) }
    }, [waitBeforeShow]);
  
    return isShown ? children : <div />;
};

const ConnectionLost = ()=> {
    return (
        <Delayed>
            <main className='bg-gray-light col-span-7 p-12 h-screen '>
                <h1 className='tet-3xl text-center p-6'>
                    Loading...
                </h1>
            </main>
        </Delayed>
    )
}

const SocketHandler = ({children, requestedData}) => {
    const [connected, setConnected] = useState(true)

    useEffect(() => {
        const handleDisconnect = async (_e) => {
            console.log('Pairamid has disconnected.')
            SOCKET.io.off("connect_error")
            setConnected(false)
            for(let i=1; i <= 100; i++){
                await sleep(1000)
                if(SOCKET.disconnected){
                    console.log(`Reconnect attempt: ${i} of 100`)
                } else {
                    console.log('Reconnecting')
                    window.location.reload()
                    break;
                }
            }

            if(SOCKET.disconnected){
                SOCKET.disconnect()
            } else {
                console.log('Connection established.')
            }

        }
        SOCKET.on('disconnect', (e) => { handleDisconnect(e) });
        SOCKET.io.on("connect_error", (_e)=> { handleDisconnect() })
        return () => {
            SOCKET.off('disconnect');
        }

    }, [setConnected])

    return (
        connected && requestedData ? children : <ConnectionLost /> 
    )

}
export default SocketHandler;
