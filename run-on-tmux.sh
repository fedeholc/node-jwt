#!/bin/bash

# Nombre de la sesión
SESSION="node-jwt"

# Comprobar si la sesión ya existe
tmux has-session -t $SESSION 2>/dev/null

if [ $? != 0 ]; then
  # Crear nueva sesión en detached mode (en segundo plano)
  tmux new-session -d -s $SESSION

  tmux send-keys -t $SESSION:0 'cd ~/dev-repos/playground-node/node-jwt/src/front' C-m
  tmux send-keys -t $SESSION:0 'npx http-server' C-m

  tmux split-window -h   

  tmux select-pane -t $SESSION:0.1
  tmux send-keys -t $SESSION:0.1 'cd ~/dev-repos/playground-node/node-jwt/' C-m
  tmux send-keys -t $SESSION:0.1 'npm start' C-m

  tmux select-pane -t $SESSION:0.1
  tmux split-window -v

  tmux select-pane -t $SESSION:0.2
  tmux send-keys -t $SESSION:0.2 'cd ~/dev-repos/playground-node/node-jwt/' C-m
  sleep 0.5
  tmux send-keys -t $SESSION:0.2 'npm run test' C-m

  tmux select-pane -t $SESSION:0.0
fi


# Adjuntar a la sesión
tmux attach-session -t $SESSION