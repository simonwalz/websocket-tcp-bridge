# Bridge TCP connections through a WebSocket server

These tools help to bridge connections through a (WebSocket) server.

## Bridge SSH connections:

```
Concept:

         client.js                index.js
SSHC  => TCP-Server/WS-Client  => WS-Server/TCP-Client => SSHD

```

Client:

```ssh_config
Host ws-myhost
	HostName myhost.example.com
	ProxyCommand PATH_TO_WEBSOCKET_TCP_BRIDGE/pipe.js wss://%h


```

Server (Apache):
```apache
SSLProxyEngine On
ProxyRequests Off
<Location /ws/n89g8ssc5jlzs5vn>
       ProxyPass ws://localhost:8022
</Location>
```

