# Bridge TCP connections through a WebSocket server

These tools help to bridge connections through a (WebSocket) server.


Concept (here SSH connections):

```
            client.js                server.js
   SSHC  => TCP-Server/WS-Client  => WS-Server/TCP-Client => SSHD
```

```
            pipe.js             server.js
  SSHC   => STDIO/WS-Client  => WS-Server/TCP-Client => SSHD
  via
 Proxy-
Command
```



## Commands


### Map WebSocket server to TCP client

Command: `server.js [localport] [remotehost] [remoteport]`

| Name | Description |
|------|-------------|
| `localport` | Local port<br/>Example: `8022` |
| `remotehost` | Remote host<br/>Default: `localhost` |
| `remoteport` | Remote port<br/>Default: `22` |


Configure Apache Server to forward WebSocket connections:

```apache
SSLProxyEngine On
ProxyRequests Off
<Location /ws/n89g8ssc5jlzs5vn>
       ProxyPass ws://localhost:8022
</Location>
```

Start daemon via screen and cron:

```crontab
@reboot screen -d -m -S ws-tcp-bridge /path-to-websocket-tcp-bridge/server.js
```


### Map stdio to WebSocket

Command: `pipe.js [websocketpath]`

| Name | Description |
|------|-------------|
| `websocketpath` | Path to the WebSocket server provided by the `server.js` command.<br/>Example: `ws://myserver/`<br/>Example: `wss://myapacheserver/ws/n89g8ssc5jlzs5vn` |

Configure SSH to use the pipe program:

```ssh-config
Host ws-myhost
	HostName myhost.example.com
	ProxyCommand /path-to-websocket-tcp-bridge/pipe.js wss://%h/ws/n89g8ssc5jlzs5vn
```


### Map TCP server to WebSocket

`client.js [localport] [websocketpath]`

| Name | Description |
|------|-------------|
| `localport` | Local port<br/>Example: `8022` |
| `websocketpath` | Path to the WebSocket server provided by the `server.js` command.<br/>Example: `ws://myserver/`<br/>Example: `wss://myapacheserver/ws/n89g8ssc5jlzs5vn` |


## License

This software is released under the MIT license.

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
