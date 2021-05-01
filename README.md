# Bridge TCP connections through a WebSocket server

These tools help to bridge connections through a (WebSocket) server.

## Bridge SSH connections:

```
Concept:

         client.js                index.js
SSHC  => TCP-Server/WS-Client  => WS-Server/TCP-Client => SSHD

```

Client:

```ssh-config
Host ws-myhost
	HostName myhost.example.com
	ProxyCommand /path-to-websocket-tcp-bridge/pipe.js wss://%h/ws/n89g8ssc5jlzs5vn


```

Server (Apache):

```apache
SSLProxyEngine On
ProxyRequests Off
<Location /ws/n89g8ssc5jlzs5vn>
       ProxyPass ws://localhost:8022
</Location>
```

Start daemon via screen and cron:

```crontab
@reboot screen -d -m -S ws-tcp-bridge /path-to-websocket-tcp-bridge/index.js
```
