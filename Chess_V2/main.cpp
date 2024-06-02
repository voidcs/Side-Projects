#include <iostream>
#include <algorithm>
#include <iomanip>
#include <queue>
#include <unordered_map>
#include <set>
#include <stack>
#include <valarray>
#include "Piece.h"
#include "BST.h"
using namespace std;

Piece** inilBoard();    //Sets all the pieces at the start of the game
void output(Piece**);   //Outputs the current state of the board
queue<string> possibleMoves(Piece**, string);   //Tells the player every possible move with that piece
int validPiece(Piece**, string, int);           //Checks if the player chose a piece that belonged to them
void movePiece(Piece**, string, string, int, unordered_map<string, int>&);        //Moves the piece to where the user selected
void knightChoices(Piece**, queue<string>&, int, int, int); //Possible moves for a knight
void rookChoices(Piece**, queue<string>&, int, int, int);   //Possible moves for a rook
void bishopChoices(Piece**, queue<string>&, int, int, int); //Possible moves for a bishop
void queenChoices(Piece**, queue<string>&, int, int, int);  //Possible moves for a queen
void kingChoices(Piece**, queue<string>&, int, int, int);   //Possible moves for the king
void pawnChoices(Piece**, queue<string>&, int, int, int, string);   //Possible moves for a pawn
void displayCaptures(unordered_map<string, int>, unordered_map<string,int>);    //Shows which pieces have been captured by each player
bool checkKing(Piece**, int, int, int, int, int);   //Checks if the king will be in danger after moving a piece
bool checkKing(Piece**, int);                       //Checks if a player puts the other player in check
bool checkKingMove(Piece**, int, int, int);         //Checks if the king moves himself into danger
bool checkmate(Piece**, int);                       //Checks if a player has no moves to make which is checkmate
bool staleMate(Piece**, int);                       //Check if player is left in stalemate
void moveCastle(Piece**, string, int);              //Switches the pieces for the castle
void pawnPromotion(Piece**, int);                   //Promotes pawn if reaches end of board
void removeEnPassant(Piece**, int);                 //Removes ability to use en passant if it is not used the first turn
void undoMove(Piece**, stack <pair<pair<string,Piece>, pair<string,Piece>>>&);  //Undoes the last move
void bubbleSort(vector<string>&, int);
void pawnChains(Piece**, int);

    

int main() {
    //Create the board
    Piece** board = new Piece*[8];
    for(int i = 0; i < 8; i++){
        board[i] = new Piece[8];
    }
    cout<<endl<<endl;
    
    //Set the board to the start of the game
    board = inilBoard();
    
    int turn = 2;       //Represents whether it is player 1 or player 2's turn
    bool gameOver = 0;  //Gets set to 1 when the game ends
    int valid = 0;      //Used to determine if the user make a valid move
    bool moveMade = 0;  //Used to check when the user has completed their turn
    string input;       //Holds the piece that the user wants to move
    string moveTo;      //Holds the location to move said piece to
    queue<string> moves;    //Gets possible moves pushed and uses temp queue to output
    set<string> options;    //Has all possible moves. User is allowed to move if their choice is in the set
    unordered_map <string, int> player1_captures; //Stores the pieces that player 1 has captured
    unordered_map <string, int> player2_captures; //Stores the pieces that player 2 has captured
    stack <pair<pair<string,Piece>, pair<string,Piece>>> undoMoves; //Stores all moves in the game, last move on top
    int winner = 0;
    //Plays until the gameOver flag is set to true
    while(!gameOver){
        moveMade = 0;   //Player has not yet made a move
        while(!moveMade){
            output(board);  //Output state of the board
            cout<<"Player "<<turn<<" select a piece to move: \n";
            cout<<"Enter 'captured' for lists of captured pieces\n";
            cout<<"Enter 'undo' to undo the last move\n";
            cin>>input;
            
            if(input == "undo"){
                //If there are moves to undo
                if(undoMoves.size()){
                    //Undo the move
                    undoMove(board, undoMoves);
                    //Change back to the other player's turn
                    if(turn == 2)
                        turn = 1;
                    else if(turn == 1)
                        turn = 2;
                }
                else{
                    cout<<"There are no moves to undo\n";
                }
                continue;
            }
     
            //Display pieces captured by both players
            if(input == "captured"){
                displayCaptures(player1_captures, player2_captures);
                cout<<"\nPlayer "<<turn<<" select a piece to move: \n";
                cin>>input;
            }
            
            valid = validPiece(board, input, turn); //Check if the piece selected is valid
            
            while(!valid){  //Continue to ask for input until a valid piece is chosen
                cout<<"That is not a piece of yours, select another: \n";
                cin>>input;
                valid = validPiece(board, input, turn);
            }
            moves = possibleMoves(board, input);    //Stores possible moves into queue
            
            if(moves.empty()){  //If there are no moves...
                cout<<"There are no possible moves for this piece\n";
            }
            else{       //Otherwise if there are moves, pick one
                valid = 0;
                
                while(!valid){
                    queue<string> outputQueue = moves;
                    cout<<"Select a move or '00' to pick another piece\n";
                    cout<<"Your possible moves are: ";
                    
                    while(!outputQueue.empty()){
                        options.insert(outputQueue.front());    //Insert front of queue to set
                        outputQueue.pop();                      //Pop the front
                    }
                    
                    //Create root node for tree
                    BST b, *root = NULL;

                    //output contents of the set
                    set<string>::iterator it;
                    it = options.begin();
                    //Set first node
                    root = b.insert(root, *it);
                    
                    
                    bool skip = 0;  //Skip the first item in set because the root is already initialized
                    for(it = options.begin(); it != options.end(); it++){
                        if(skip)
                            b.insert(root, *it);    //Insert the string into the tree
                        skip = 1;
                    }
                    
                    b.print(root);
                    cout<<endl;
                    
                    cin>>moveTo;        //Player enters which choice they would like to move to
                    if(options.count(moveTo))   //If the choice exists in the set, continue
                        valid = 1;
                    else if(moveTo == "00")     //If the user chooses 00, let them choose another piece
                        valid = 2;
                    else{
                        cout<<endl<<"That was not a valid choice\n";
                    }
                }
                
                //empty the set
                options.clear();
                if(valid == 1)
                    moveMade = 1;
            }
        }

        //If the player castles we handle it differently
        if(moveTo == "castleLong" || moveTo == "castleShort"){
            moveCastle(board, moveTo, turn);
            
            //Append which player castled to the string
            string forUndo = to_string(turn) + moveTo;
            //Push into stack to undo moves
            undoMoves.push(make_pair(make_pair(forUndo, board[0][0]), make_pair(forUndo, board[0][0])));
        }
        else{   //Otherwise move the piece regularly
            //Convert input to row and col
            int row = moveTo[1] - '0' - 1;
            int col = moveTo[0] - 'a';
            //If the move captured another piece
            if(board[row][col].player != 0){
                if(turn == 1){
                    //Add to player1's captures
                    player1_captures[board[row][col].name]++;
                }
                else{
                    //Add to player2's captures
                    player2_captures[board[row][col].name]++;
                }
            }
            
            int bRow = input[1] - '0' - 1;
            int bCol = input[0] - 'a';
            //Change chosen move to row and col
            int moveRow = moveTo[1] - '0' - 1;
            int moveCol = moveTo[0] - 'a';
            //Switch player turns
            undoMoves.push(make_pair(make_pair(input, board[bRow][bCol]), make_pair(moveTo, board[moveRow][moveCol])));
            //Move the piece
            if(turn == 1)
                movePiece(board, input, moveTo, turn, player1_captures);
            else if(turn == 2)
                movePiece(board, input, moveTo, turn, player1_captures);
        }
        
        //Check if a pawn has reached the end of the board
        pawnPromotion(board, turn);
        
        pawnChains(board, turn);
        
        if(turn == 1)
            turn = 2;
        else if(turn == 2)
            turn = 1;
        
        //Remove the ability to en passant (can only be done the turn after the opponent moves 2 spaces)
        removeEnPassant(board, turn);
        
        //Check for checkmate
        if(checkmate(board, turn)){
            gameOver = 1;
            if(turn == 1)
                winner = 2;
            else
                winner = 1;
        }
        
        //Check if a player has been put in check
        else if(checkKing(board, turn)){
            cout<<"\n==========================================================================\n";
            cout<<"CHECK\n";
            cout<<"==========================================================================\n\n";
        }
        
    }
    
    //Output final board state
    output(board);
    cout<<"\n==========================================================================\n";
    cout<<"CHECKMATE\n";
    cout<<"==========================================================================\n\n";
    cout<<"PLAYER "<<winner<<" has won the game!\n";
    
    return 0;
}

/*
==============================================================================================================
==============================================================================================================
==============================================================================================================
==============================================================================================================
*/

void pawnChains(Piece **board, int player){
    
    int visited[8][8];
    vector< vector<pair<int, int>> > v; //Stores all chains and their coordinates
    
    //Set everything to zero
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            visited[i][j] = 0;
        }
    }
    
    
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            //If the pawn belongs to the player and has not been visited yet
            if(board[i][j].name == "pawn" && board[i][j].player == player && visited[i][j] == 0){
                bool flag = 0;  //Used to check if we have two pawns in the chain
                
                //Check if top left diagonal has a chained pawn
                if(i-1>=0 && j-1>=0){
                    if(board[i-1][j-1].player == player && board[i-1][j-1].name == "pawn" && visited[i-1][j-1] == 0){
                        flag = 1;
                    }
                }
                
                //Check if bottom right diagonal has a chained pawn
                if(i+1<8 && j+1<8){
                    if(board[i+1][j+1].player == player && board[i+1][j+1].name == "pawn" && visited[i+1][j+1] == 0){
                        flag = 1;
                    }
                }
                
                //Check if top right diagonal has a chained pawn
                if(i-1>=0 && j+1<8){
                    if(board[i-1][j+1].player == player && board[i-1][j+1].name == "pawn" && visited[i-1][j+1] == 0){
                        flag = 1;
                    }
                }
                
                //Check if bottom left diagonal has a chained pawn
                if(i+1<8 && j-1>=0){
                    if(board[i+1][j-1].player == player && board[i+1][j-1].name == "pawn" && visited[i+1][j-1] == 0){
                        flag = 1;
                    }
                }
                
                //If there is at least two chained pawns
                if(flag){
                    
                    vector<pair<int, int>> chain;   //Vector to hold coordinates for each chained pawn
                    visited[i][j] = v.size() + 1;   //Marks the array to the chain number
                    chain.push_back({i,j});         //Add the first pawn to the chain
                    queue< pair<int, int> > q;      //Queue to initiate breadth first search
                    q.push({i,j});                  //Push first pawn into queue
                    
                    while(!q.empty()){
                        
                        //Get the x and y coordinates of this pawn
                        int x = q.front().first;
                        int y = q.front().second;
                        
                        //Check top left for another pawn
                        if(x-1>=0 && y-1>=0){
                            if(board[x-1][y-1].player == player && board[x-1][y-1].name == "pawn" && visited[x-1][y-1] == 0){
                                visited[x-1][y-1] = v.size() + 1;   //Mark this pawn to be part of a chain
                                q.push({x-1, y-1});                 //Push newly chained pawn into queue
                                chain.push_back({x-1, y-1});        //Push new pawn into the list of chained pawns
                            }
                        }

                        //Check bottom right for another pawn
                        if(x+1<8 && y+1<8){
                            if(board[x+1][y+1].player == player && board[x+1][y+1].name == "pawn" && visited[x+1][y+1] == 0){
                                visited[x+1][y+1] = v.size() + 1;   //Mark this pawn to be part of a chain
                                q.push({x+1, y+1});                 //Push newly chained pawn into queue
                                chain.push_back({x+1, y+1});        //Push new pawn into the list of chained pawns
                            }
                        }
                        
                        //Check bottom left for another pawn
                        if(x+1<8 && y-1>=0){
                            if(board[x+1][y-1].player == player && board[x+1][y-1].name == "pawn" && visited[x+1][y-1] == 0){
                                visited[x+1][y-1] = v.size() + 1;   //Mark this pawn to be part of a chain
                                q.push({x+1, y-1});                 //Push newly chained pawn into queue
                                chain.push_back({x+1, y-1});        //Push new pawn into the list of chained pawns
                            }
                        }

                        //Check top right for another pawn
                        if(x-1>=0 && y+1<8){
                            if(board[x-1][y+1].player == player && board[x-1][y+1].name == "pawn" && visited[x-1][y+1] == 0){
                                visited[x-1][y+1] = v.size() + 1;   //Mark this pawn to be part of a chain
                                q.push({x-1, y+1});                 //Push newly chained pawn into queue
                                chain.push_back({x-1, y+1});        //Push new pawn into the list of chained pawns
                            }
                        }
                        
                        q.pop();    //Pop this pawn
                    }
                    
                    v.push_back(chain); //Add this chain to the vector containing all the chains
                }
            }
        }
    }
    
    cout<<"LIST: \n";
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            cout<<visited[i][j]<<" ";
        }
        cout<<endl;
    }
    
    if(v.size() == 0)
        cout<<"THERE ARE NO PAWN CHAINS\n";
    else{
        
        //Converts x,y coordinates of pawns into chess board coordinates
        vector< vector<string> > chains;
        
        
        for(int i = 0; i < v.size(); i++){
            //Holds the string for each pawn chain
            vector<string> temp;
            for(int j = 0; j < v[i].size(); j++){
                //Convert coordinates into chess coordinates
                string str;
                char c = 'a';
                c += v[i][j].second;
                str = c;
                str += to_string(v[i][j].first + 1);
                temp.push_back(str);
            }
            //Push this chain into list of pawn chains
            chains.push_back(temp);
        }
        
        //Recursively sort the order of the pawns' coordinates
        for(int i = 0; i < chains.size(); i++){
            bubbleSort(chains[i], (int)chains[i].size());
        }
        
        //Output the pawn chains for this specific player
        cout<<"\nThere are "<<chains.size()<<" pawn chains\n\n";
        for(int i = 0; i < chains.size(); i++){
            cout<<"Pawns in chain "<<i+1<<": ";
            for(int j = 0; j < v[i].size(); j++){
                cout<<chains[i][j]<<" ";
            }
            cout<<endl;
        }
    }
    
}

void bubbleSort(vector<string> &a, int n){
    //End if we're on the last iteration
    if(n == 1)
        return;
    
    //Loop for swaps
    for(int i = 0; i < n-1; i++){
        if(a[i] > a[i+1])
            swap(a[i], a[i+1]);
    }
    //Call again
    bubbleSort(a, n - 1);
}

void undoMove(Piece **board, stack <pair<pair<string,Piece>, pair<string,Piece>>>& undoMoves){
    
    if(undoMoves.size()){
        string before = undoMoves.top().first.first;    //The string typed by the user for the location of the piece
        string after = undoMoves.top().second.first;    //The string typed by the user for the location to move this piece
        Piece restore1 = undoMoves.top().first.second;  //The piece that was moved
        Piece restore2 = undoMoves.top().second.second; //The piece that was either captured by the player or it was empty
        undoMoves.pop();    //Remove from stack
        
        //Change user input into rows and cols
        int beforeRow = before[1] - '0' - 1;
        int beforeCol = before[0] - 'a';
        int afterRow = after[1] - '0' - 1;
        int afterCol = after[0] - 'a';
        
        //If there is a 1 or 2 in front of the string, the player castled
        if(before[0] == '1' || before[0] == '2'){
            //Get the player who castled
            int turn = before[0] - '0';
            int row;
            
            //If player 1 castled, then it was on row 7
            if(turn == 1)
                row = 7;
            //Otherwise it was player 2 on row 0
            else
                row = 0;
            
            //Remove the number from the front of the user input
            before.erase(0,1);
 
            //If the user inputted castleShort
            if(before == "castleShort"){
                //Set the rook back in its position
                board[row][7].player = turn;
                board[row][7].name = "rook";
                board[row][7].moves = 0;
                
                //Set the spaces between the king and rook to be empty
                for(int i = 0; i < 2; i++){
                    board[row][6-i].player = 0;
                    board[row][6-i].moves = 0;
                    board[row][6-i].name = "empty";
                }
            }
            
            //If the user inputted castleLong
            if(before == "castleLong"){
                //Set the rook back in its position
                board[row][0].player = turn;
                board[row][0].name = "rook";
                board[row][0].moves = 0;
                
                //Set the spaces between the king and rook to be empty
                for(int i = 0; i < 3; i++){
                    board[row][1+i].player = 0;
                    board[row][1+i].moves = 0;
                    board[row][1+i].name = "empty";
                }
            }
            
            //Set the king back in the start position
            board[row][4].player = turn;
            board[row][4].name = "king";
            board[row][4].moves = 0;
            
            return;
        }
        
        //If a pawn moved diagonally and did not capture a piece on that diagonal then it must have been en passant
        if(restore1.name == "pawn" && abs(beforeRow-afterRow) == 1 && abs(beforeCol-afterCol) == 1 && restore2.player == 0){

            //Revive the captured piece
            if(restore1.player == 1){
                board[afterRow+1][afterCol].player = 2;
                board[afterRow+1][afterCol].name = "pawn";
                board[afterRow+1][afterCol].en_passant = 1;
                board[afterRow+1][afterCol].moves = 1;
            }
            //Revive the captured piece
            else if(restore1.player == 2){
                board[afterRow-1][afterCol].player = 1;
                board[afterRow-1][afterCol].name = "pawn";
                board[afterRow-1][afterCol].en_passant = 1;
                board[afterRow-1][afterCol].moves = 1;
            }     
        }
        
        //Set the position that the player moved to back to what it was
        board[beforeRow][beforeCol] = restore1;
        
        //Set the position that the player started at to back what it was
        board[afterRow][afterCol] = restore2;
        
    }
}

void removeEnPassant(Piece **board, int player){
    
    //Remove the en passant tag from every piece belonging to a certain player
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            if(board[i][j].player == player && board[i][j].name == "pawn"){
                board[i][j].en_passant = 0;
            }
        }
    }
}

void pawnPromotion(Piece** board, int player){
    
    //Contains all the possible promotions
    set<string> options;
    options.insert("queen");
    options.insert("knight");
    options.insert("rook");
    options.insert("bishop");
    
    bool valid = 0;
    string choice;
    int row = 0;
    //Player 1 must reach row 0 to promote
    
    if(player == 1)
        row = 0;
    
    //Player 2 must reach row 7 to promote
    else
        row = 7;
    
    //Check the board for a pawn that belongs to this player and is ready to be promoted
    for(int i = 0; i < 8; i++){
        if(board[row][i].name == "pawn" && board[0][i].player == player){
            cout<<"\n==========================================================================\n";
            cout<<"PAWN PROMOTION! SELECT A PIECE\n";
            cout<<"You may choose a: ";
            set<string>::iterator it;
            //Output possible promotions
            for(it = options.begin(); it != options.end(); it++){
                cout<<*it<<" ";
            }
            cout<<endl;
            cin>>choice;
            if(options.count(choice))
                valid = 1;

            //Input validation
            while(!valid){
                cout<<"NOT A VALID PIECE, CHOOSE AGAIN\n";
                cin>>choice;
                if(options.count(choice))
                    valid = 1;
            }
            //Change the piece to now have the value of the chosen promotion
            board[row][i].name = choice;
        }
    }
}

bool checkmate(Piece **board, int player){
    //Queue to store all moves for a certain piece
    queue<string> moves;
    bool flag = 1;  //If any single piece can be moved, then the player is not checkmated
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            //If this is their piece...
            if(board[i][j].player == player){
                //Converting the row and col to the board coordinates
                char temp = 'a';
                temp += j;
                string pos;
                pos += temp;
                pos += to_string(i+1);
                //See if said piece has any moves
                moves = possibleMoves(board, pos);
                //If this piece has any possible moves then the game must not be over
                //Note that you cannot make a move that that does not account for your king being in check or exposing it
                if(!moves.empty()){
                    flag = 0;
                }
            }
        }
    }
    if(flag)
        return 1;
    else
        return 0;
}

bool checkKingMove(Piece **board, int row, int col, int player){
    
    bool inCheck = 0;
    
    //Checking if this move would put the king in danger of a knight
    int xdist, ydist;   //Keep track of the distance from the king
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            xdist = abs(i-row);     //calculates difference in rows
            ydist = abs(j-col);     //calculates difference in cols
            xdist *= xdist;         //square both distances
            ydist *= ydist;
            
            if(ydist + xdist == 5){ //If their sum is 5, then it is a valid knight move
                //If the piece at this spot is a knight and does not belong to the player
                if(board[i][j].player != player && board[i][j].name == "knight"){
                    inCheck = 1;
                }
            }
        }
    }

    //Check up for an enemy queen or rook
    int moveRow = row + 1;
    int moveCol = col;
    string pieceType;
    //While we have not reached the end of the board
    while(moveRow < 8){
        pieceType = board[moveRow][moveCol].name;
        //if the piece is a rook or queen belonging to an opponent we are in check
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow++;
    }
    
    //Check down for an enemy queen or rook
    moveRow = row - 1;
    moveCol = col;
    //While we have not reached the end of the board
    while(moveRow >= 0){
        pieceType = board[moveRow][moveCol].name;
        //if the piece is a rook or queen belonging to an opponent we are in check
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow--;
    }
    
    //Check right for an enemy queen or rook
    moveRow = row;
    moveCol = col + 1;
    //While we have not reached the end of the board
    while(moveCol < 8){
        pieceType = board[moveRow][moveCol].name;
        //if the piece is a rook or queen belonging to an opponent we are in check
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveCol++;
    }
    
    //Check left for an enemy queen or rook
    moveRow = row;
    moveCol = col - 1;
    //While we have not reached the end of the board
    while(moveCol >= 0){
        pieceType = board[moveRow][moveCol].name;
        //if the piece is a rook or queen belonging to an opponent we are in check
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveCol--;
    }

    //Check top left diagonally
    moveRow = row-1;
    moveCol = col-1;
    //While we have not reached the end of the board
    while(moveRow >= 0 && moveCol >= 0 ){
        pieceType = board[moveRow][moveCol].name;
        //if the piece is a bishop or queen belonging to an opponent we are in check
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow--;
        moveCol--;
    }

    //Check bottom right diagonally
    moveRow = row+1;
    moveCol = col+1;
    //While we have not reached the end of the board
    while(moveRow < 8 && moveCol < 8){
        pieceType = board[moveRow][moveCol].name;
        //if the piece is a bishop or queen belonging to an opponent we are in check
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow++;
        moveCol++;
    }
    
    //Check top right diagonally
    moveRow = row-1;
    moveCol = col+1;
    //While we have not reached the end of the board
    while(moveRow >= 0 && moveCol < 8){
        pieceType = board[moveRow][moveCol].name;
        //if the piece is a bishop or queen belonging to an opponent we are in check
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow--;
        moveCol++;
    }

    //Check bottom left diagonally
    moveRow = row+1;
    moveCol = col-1;
    //While we have not reached the end of the board
    while(moveRow < 8 && moveCol >= 0){
        pieceType = board[moveRow][moveCol].name;
        //if the piece is a bishop or queen belonging to an opponent we are in check
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow++;
        moveCol--;
    }
    
    //Checks if the move would put the king in danger of a pawn for player 1
    if(player == 1){
        if(row-1 >= 0 && col-1 >= 0){
            if(board[row-1][col-1].name == "pawn" && board[row-1][col-1].player != player){
                inCheck = 1;
            }
        }
        if(row-1 >= 0 && col+1 < 8){
            if(board[row-1][col+1].name == "pawn" && board[row-1][col+1].player != player){
                inCheck = 1;
            }
        }
    }
    
    //Checks if the move would put the king in danger of a pawn for player 2
    if(player == 2){
        if(row+1 < 8 && col-1 >= 0){
            if(board[row+1][col-1].name == "pawn" && board[row+1][col-1].player != player){
                inCheck = 1;
            }
        }
        if(row-1 < 8 && col+1 < 8){
            if(board[row+1][col+1].name == "pawn" && board[row+1][col+1].player != player){
                inCheck = 1;
            }
        }
    }
    
    if(inCheck)
        return 1;
    else
        return 0;
}

bool checkKing(Piece **board, int player){
    bool inCheck = 0;
    
    //Find location of king
    int row;
    int col;
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            //set row and col to position of king
            if(board[i][j].name == "king" && board[i][j].player == player){
                row = i;
                col = j;
            }
        }
    }
    
    //Checking if this move would put the king in danger of a knight
    int xdist, ydist;   //Keep track of the distance from the king
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            xdist = abs(i-row);     //calculates difference in rows
            ydist = abs(j-col);     //calculates difference in cols
            xdist *= xdist;         //square both distances
            ydist *= ydist;
            
            if(ydist + xdist == 5){ //If their sum is 5, then it is a valid knight move
                //If the piece at this spot is a knight and does not belong to the player
                if(board[i][j].player != player && board[i][j].name == "knight"){
                    inCheck = 1;
                }
            }
        }
    }

    //Check up for an enemy queen or rook
    int moveRow = row + 1;
    int moveCol = col;
    string pieceType;
    //While we have not reached the end of the board
    while(moveRow < 8){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow++;
    }
    
    //Check down for an enemy queen or rook
    moveRow = row - 1;
    moveCol = col;
    //While we have not reached the end of the board
    while(moveRow >= 0){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow--;
    }
    
    //Check right for an enemy queen or rook
    moveRow = row;
    moveCol = col + 1;
    //While we have not reached the end of the board
    while(moveCol < 8){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveCol++;
    }
    
    //Check left for an enemy queen or rook
    moveRow = row;
    moveCol = col - 1;
    //While we have not reached the end of the board
    while(moveCol >= 0){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveCol--;
    }

    //Check top left diagonally
    moveRow = row-1;
    moveCol = col-1;
    //While we have not reached the end of the board
    while(moveRow >= 0 && moveCol >= 0 ){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow--;
        moveCol--;
    }

    //Check bottom right diagonally
    moveRow = row+1;
    moveCol = col+1;
    //While we have not reached the end of the board
    while(moveRow < 8 && moveCol < 8){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow++;
        moveCol++;
    }
    
    //Check top right diagonally
    moveRow = row-1;
    moveCol = col+1;
    //While we have not reached the end of the board
    while(moveRow >= 0 && moveCol < 8){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow--;
        moveCol++;
    }

    //Check bottom left diagonally
    moveRow = row+1;
    moveCol = col-1;
    //While we have not reached the end of the board
    while(moveRow < 8 && moveCol >= 0){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow++;
        moveCol--;
    }
    
    //Checks if the move would put the king in danger of a pawn for player 1
    if(player == 1){
        if(row-1 >= 0 && col-1 >= 0){
            if(board[row-1][col-1].name == "pawn" && board[row-1][col-1].player != player){
                inCheck = 1;
            }
        }
        if(row-1 >= 0 && col+1 < 8){
            if(board[row-1][col+1].name == "pawn" && board[row-1][col+1].player != player){
                inCheck = 1;
            }
        }
    }
    
    //Checks if the move would put the king in danger of a pawn for player 2
    if(player == 2){
        if(row+1 < 8 && col-1 >= 0){
            if(board[row+1][col-1].name == "pawn" && board[row+1][col-1].player != player){
                inCheck = 1;
            }
        }
        if(row-1 < 8 && col+1 < 8){
            if(board[row+1][col+1].name == "pawn" && board[row+1][col+1].player != player){
                inCheck = 1;
            }
        }
    }
    
    if(inCheck)
        return 1;
    else
        return 0;
}

bool checkKing(Piece **board, int beginRow, int beginCol, int endRow, int endCol, int player){
    
    //This checks if the player is moving a piece that protects the king from check
    
    //Variable to save the type of piece
    string savePiece = board[beginRow][beginCol].name;
    
    //Pretend as if the player really made the move
    board[beginRow][beginCol].name = "empty";
    board[beginRow][beginCol].player = 0;
    
    //Save the piece
    string recoverName = board[endRow][endCol].name;
    int recoverPlayer = board[endRow][endCol].player;
    
    //Act as if the user makes this move
    //This will be reverted
    board[endRow][endCol].player = player;
    
    //Find position of the king
    int kingRow, kingCol;
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            if(board[i][j].player == player && board[i][j].name == "king"){
                kingRow = i;
                kingCol = j;
            }
        }
    }
    bool inCheck = 0;
    
    //Calculate if the king is in check to a knight
    int xdist, ydist;
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            xdist = abs(i-kingRow); //Distance in rows
            ydist = abs(j-kingCol); //Distance in cols
            xdist *= xdist;         //Square both
            ydist *= ydist;
            
            //If the distance is equal to 5, then a knight can reach the king
            if(ydist + xdist == 5){
                if(board[i][j].player != player && board[i][j].name == "knight"){
                    inCheck = 1;
                }
            }
        }
    }
    
    //Check down for a queen or rook
    int moveRow = kingRow + 1;
    int moveCol = kingCol;
    string pieceType;
    while(moveRow < 8){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
            }
            else{
                break;
            }
        }
        moveRow++;
    }
    
    //Check up for a queen or rook
    moveRow = kingRow - 1;
    moveCol = kingCol;
    while(moveRow >= 0){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
            }
            else{
                break;
            }
        }
        moveRow--;
    }
    
    //Check right for a queen or rook
    moveRow = kingRow;
    moveCol = kingCol + 1;
    while(moveCol < 8){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen"){
                    inCheck = 1;
                }
            }
            else{
                break;
            }
        }
        moveCol++;
    }
    
    //Check left for a queen or rook
    moveRow = kingRow;
    moveCol = kingCol - 1;
    while(moveCol >= 0){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "rook" || pieceType == "queen")
                    inCheck = 1;
            }
            else{
                break;
            }
        }
        moveCol--;
    }
    
    //Check top left diagonally
    moveRow = kingRow-1;
    moveCol = kingCol-1;
    while(moveRow >= 0 && moveCol >= 0 ){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow--;
        moveCol--;
    }

    //Check bottom right diagonally
    moveRow = kingRow+1;
    moveCol = kingCol+1;
    while(moveRow < 8 && moveCol < 8){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow++;
        moveCol++;
    }
    
    //Check top right diagonally
    moveRow = kingRow-1;
    moveCol = kingCol+1;
    while(moveRow >= 0 && moveCol < 8){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow--;
        moveCol++;
    }

    //Check bottom left diagonally
    moveRow = kingRow+1;
    moveCol = kingCol-1;
    while(moveRow < 8 && moveCol >= 0){
        pieceType = board[moveRow][moveCol].name;
        if(board[moveRow][moveCol].player != 0){
            if(board[moveRow][moveCol].player != player){
                if(pieceType == "bishop" || pieceType == "queen"){
                    inCheck = 1;
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
        }
        moveRow++;
        moveCol--;
    }
    
    //Revert the pieces now that we know if the move would put the king in check
    board[beginRow][beginCol].name = savePiece;
    board[beginRow][beginCol].player = player;
    
    //Undo the move
    board[endRow][endCol].name = recoverName;
    board[endRow][endCol].player = recoverPlayer;
    
    
    if(inCheck)
        return 1;
    else
        return 0;
}

void displayCaptures(unordered_map<string, int> player1_captures, unordered_map<string,int> player2_captures){
    //Iterator for displaying what each player has captured
    unordered_map<string, int>::iterator mapIt;

    //If player1 has captured something
    if(!player1_captures.empty()){
        cout<<endl;
        cout<<"Player 1 has captured: \n";
        //first gives the type of piece
        //second gives the frequency that was captured
        for(mapIt = player1_captures.begin(); mapIt != player1_captures.end(); mapIt++){
            cout<<mapIt->second<<"  "<<mapIt->first;
            if(mapIt->second > 1)
                cout<<"s";
            cout<<endl;
        }
        cout<<endl;
    }
    else
        cout<<"Player 1 has not captured any pieces\n";

    //If player2 has captured something
    if(!player2_captures.empty()){
        cout<<endl;
        cout<<"Player 2 has captured: \n";
        //first gives the type of piece
        //second gives the frequency that was captured
        for(mapIt = player2_captures.begin(); mapIt != player2_captures.end(); mapIt++){
            cout<<mapIt->second<<"  "<<mapIt->first;
            if(mapIt->second > 1)
                cout<<"s";
            cout<<endl;
        }
        cout<<endl;
    }
    else
        cout<<"Player 2 has not captured any pieces\n";
}

queue<string> possibleMoves(Piece **board, string str){
    
    char letter;
    //Convert the input string to rows and col
    int row = str[1] - '0' - 1;
    int col = str[0] - 'a';
    
    queue<string> moves;    //Queue to hold possible moves for this piece
    int player = board[row][col].player;    //Checking what player the piece belongs to
    string pieceType = board[row][col].name;    //Variable that holds the type of piece
    
    //Pawn choices are accounted for separately
    pawnChoices(board, moves, row, col, player, pieceType);
    
    //Gets possible rook choices
    if(pieceType == "rook"){
        rookChoices(board, moves, row, col, player);
    }
    
    //Gets possible bishop choices
    if(pieceType == "bishop"){
        bishopChoices(board, moves, row, col, player);
    }
    
    //Gets possible queen choices
    if(pieceType == "queen"){
        queenChoices(board, moves, row, col, player);
    }
    
    //Gets possible knight choices
    if(pieceType == "knight"){
        knightChoices(board, moves, row, col, player);
    }
    
    //Gets possible king choices
    if(pieceType == "king"){
        kingChoices(board, moves, row, col, player);
    }
    
    //return the queue of options
    return moves;
}

void kingChoices(Piece **board, queue<string>& moves, int row, int col, int player){
    char letter;
    
    for(int i = -1; i <= 1; i++){
        for(int j = -1; j <= 1; j++){
            //If the coordinates are on the board and the piece does not belong to the player and the move will not put the player in check
            if(row+i>=0 && row+i<8 && col+i>=0 && col+i<8 && board[row+i][col+j].player != player && !checkKingMove(board, row+i, col+j, player)){
                //Add possible move to queue
                letter = 'a' + col + j;
                moves.push(letter + to_string(row + i + 1));
            }
        }
    }
    
    //If the king has no moved yet
    if(board[row][col].moves == 0){
        
        //If player1's king is chosen
        if(player == 1){
            //If the piece at the bottom right is a rook and has not been moved
            if(board[7][7].name == "rook" && board[7][7].moves == 0){
                //If there are no piece between the rook and king
                if(board[7][6].name == "empty" && board[7][5].name == "empty"){
                    //Make sure that the king is not currently in check
                    //Make sure that the castle will not put the king in check
                    if(!checkKing(board, player) && !checkKingMove(board,row, col+2, player))
                        moves.push("castleShort");
                }
            }
            //If the piece at the bottom left is a rook and has not been moved
            if(board[7][0].name == "rook" && board[7][0].moves == 0){
                //If there are no piece between the rook and king
                if(board[7][1].name == "empty" && board[7][2].name == "empty" && board[7][3].name == "empty"){
                    //Make sure that the king is not currently in check
                    //Make sure that the castle will not put the king in check
                    if(!checkKing(board, player) && !checkKingMove(board, row, col-2, player))
                        moves.push("castleLong");
                }
            }
        }
        
        //If player2's king is chosen
        if(player == 2){
            //If the piece at the top right is a rook and has not been moved
            if(board[0][7].name == "rook" && board[0][7].moves == 0){
                //If there are no piece between the rook and king
                if(board[0][6].name == "empty" && board[0][5].name == "empty"){
                    //Make sure that the king is not currently in check
                    //Make sure that the castle will not put the king in check
                    if(!checkKing(board, player) && !checkKingMove(board, row, col+2, player))
                        moves.push("castleShort");
                }
            }
            //If the piece at the top left is a rook and has not been moved
            if(board[0][0].name == "rook" && board[0][0].moves == 0){
                //If there are no piece between the rook and king
                if(board[0][1].name == "empty" && board[0][2].name == "empty" && board[0][3].name == "empty"){
                    //Make sure that the king is not currently in check
                    //Make sure that the castle will not put the king in check
                    if(!checkKing(board, player) && !checkKingMove(board, row, col-2, player))
                        moves.push("castleLong");
                }
            }
        }
        
    }
}

void knightChoices(Piece** board, queue<string>& moves, int row, int col, int player){
    //Calculate the distance between this piece and other positions on the board
    //The distance between a knight's original position and its final position will always be sqrt(5)
    int xdist, ydist;
    char letter;
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            xdist = abs(i-row); //row distance
            ydist = abs(j-col); //col distance
            xdist *= xdist; //Square both
            ydist *= ydist;
            
            //If their sum equals 5 then it is a possible knight path
            if(ydist + xdist == 5){
                //Check that this position is not occupied by a friendly piece
                //Also check that moving this knight will not put the king in check
                if(board[i][j].player != player && !checkKing(board, row, col, i, j, player)){
                    letter = 'a' + j;
                    //Add option to queue
                    moves.push(letter + to_string(i+1));
                }
            }
        }
    }
}

void pawnChoices(Piece** board, queue<string> &moves, int row, int col, int player, string pieceType){
    char letter;
    if(player == 1){
        if(pieceType == "pawn"){\
            //Check if the pawn can move forward
            if(board[row-1][col].player == 0 && !checkKing(board, row, col, row-1, col, player)){
                letter = 'a' + col;
                moves.push(letter + to_string(row));
            }
            //Check if the pawn can capture on the right
            if(col+1 < 8 && board[row-1][col+1].player == 2 && !checkKing(board, row, col, row-1, col+1, player)){
                letter = 'a' + col + 1;
                moves.push(letter + to_string(row));
            }
            //Check if the pawn can capture on the left
            if(col-1 >= 0 && board[row-1][col-1].player == 2 && !checkKing(board, row, col, row-1, col-1, player)){
                letter = 'a' + col - 1;
                moves.push(letter + to_string(row));
            }
            //Check if the pawn is at its starting position and can move two spaces
            if(row == 6 && board[row-2][col].player == 0 && !checkKing(board, row, col, row-2, col, player)){
                letter = 'a' + col;
                moves.push(letter + to_string(row-1));
            }
            //Check if pawn can capture en passant to the left
            if(row == 3 && col-1 >= 0 && board[row][col-1].en_passant == 1){
                if(!checkKing(board, row, col, row+1, col-1, player)){
                    letter = 'a' + col - 1;
                    moves.push(letter + to_string(row));
                }
            }
            //Check if pawn can capture en passant to the right
            if(row == 3 && col+1 < 8 && board[row][col+1].en_passant == 1){
                if(!checkKing(board, row, col, row+1, col+1, player)){
                    letter = 'a' + col + 1;
                    moves.push(letter + to_string(row));
                }
            }
        }
    }
    else if(player == 2){
        if(pieceType == "pawn"){
            //Check if the pawn can move forward
            if(board[row+1][col].player == 0 && !checkKing(board, row, col, row+1, col, player)){
                char letter = 'a' + col;
                moves.push(letter + to_string(row+2));
            }
            //Check if the pawn can capture on the right
            if(col+1 < 8 && board[row+1][col+1].player == 1 && !checkKing(board, row, col, row+1, col+1, player)){
                letter = 'a' + col + 1;
                moves.push(letter + to_string(row+2));
            }
            //Check if the pawn can capture on the left
            if(col-1 >= 0 && board[row+1][col-1].player == 1 && !checkKing(board, row, col, row+1, col-1, player)){
                letter = 'a' + col - 1;
                moves.push(letter + to_string(row+2));
            }
            //Check if the pawn is at its starting position and can move two spaces
            if(row == 1 && board[row+2][col].player == 0 && !checkKing(board, row, col, row+2, col, player)){
                letter = 'a' + col;
                moves.push(letter + to_string(row+3));
            }
            //Check if pawn can capture en passant to the left
            if(row == 4 && col-1 >= 0 && board[row][col-1].en_passant == 1){
                if(!checkKing(board, row, col, row-1, col-1, player)){
                    letter = 'a' + col - 1;
                    moves.push(letter + to_string(row+2));
                }
            }
            //Check if pawn can capture en passant to the right
            if(row == 4 && col+1 < 8 && board[row][col+1].en_passant == 1){
                if(!checkKing(board, row, col, row-1, col+1, player)){
                    letter = 'a' + col + 1;
                    moves.push(letter + to_string(row+2));
                }
            }
        }
    }
}

void bishopChoices(Piece** board, queue<string> &moves, int row, int col, int player){
    char letter;
    //Boolean that gets changed when we can no longer move in that direction
    bool search = 1;
    //These two variables are changed to move diagonally
    int moveRow = row;
    int moveCol = col;
    
    //Look for moves going bottom right
    while(search){
        moveRow++;  //Move down
        moveCol++;  //Move right
        //If the piece is on the board, is not owned by a friendly piece and will not put the king in check
        if(moveRow < 8 &&  moveCol < 8 && board[moveRow][moveCol].player != player && !checkKing(board, row, col, moveRow, moveCol, player)){
            letter = 'a' + moveCol;
            //Add this option to the queue
            moves.push(letter + to_string(moveRow+1));
            if(board[moveRow][moveCol].player != 0)
                search = 0;
        }
        else
            search = 0;
    }
    
    search = 1;
    moveRow = row;
    moveCol = col;
    
    //Look for moves going top left
    while(search){
        moveRow--;
        moveCol--;
        //If the piece is on the board, is not owned by a friendly piece and will not put the king in check
        if(moveRow >= 0 &&  moveCol >= 0 && board[moveRow][moveCol].player != player && !checkKing(board, row, col, moveRow, moveCol, player)){
            letter = 'a' + moveCol;
            //Add this option to the queue
            moves.push(letter + to_string(moveRow+1));
            if(board[moveRow][moveCol].player != 0)
                search = 0;
        }
        else
            search = 0;
    }
    
    search = 1;
    moveRow = row;
    moveCol = col;
    
    //Look for moves going bottom left
    while(search){
        moveRow++;
        moveCol--;
        //If the piece is on the board, is not owned by a friendly piece and will not put the king in check
        if(moveRow < 8 &&  moveCol >= 0 && board[moveRow][moveCol].player != player && !checkKing(board, row, col, moveRow, moveCol, player)){
            letter = 'a' + moveCol;
            //Add this option to the queue
            moves.push(letter + to_string(moveRow+1));
            if(board[moveRow][moveCol].player != 0)
                search = 0;
        }
        else
            search = 0;
    }
    
    search = 1;
    moveRow = row;
    moveCol = col;
    //Look for moves going top right
    while(search){
        moveRow--;
        moveCol++;
        //If the piece is on the board, is not owned by a friendly piece and will not put the king in check
        if(moveRow >= 0 &&  moveCol < 8 && board[moveRow][moveCol].player != player && !checkKing(board, row, col, moveRow, moveCol, player)){
            letter = 'a' + moveCol;
            //Add this option to the queue
            moves.push(letter + to_string(moveRow+1));
            if(board[moveRow][moveCol].player != 0)
                search = 0;
        }
        else
            search = 0;
    }
}

void rookChoices(Piece** board, queue<string> &moves, int row, int col, int player){
    char letter;
    //Boolean used to see if we can find moves in a certain direction
    bool search = 1;
    int moveRow = row;
    int moveCol = col;
    while(search){
        //Search for moves going down
        moveRow++;
        //If the piece is on the board, is not owned by a friendly piece and will not put the king in check
        if(moveRow < 8 && board[moveRow][col].player != player && !checkKing(board, row, col, moveRow, col, player)){
            letter = 'a' + col;
            //Add this move to the queue
            moves.push(letter + to_string(moveRow+1));
            if(board[moveRow][col].player != 0)
                search = 0;
        }
        else
            search = 0;
    }
    search = 1;
    moveRow = row;
    while(search){
        //Search for moves going up
        moveRow--;
        //If the piece is on the board, is not owned by a friendly piece and will not put the king in check
        if(moveRow >= 0 && board[moveRow][col].player != player && !checkKing(board, row, col, moveRow, col, player)){
            letter = 'a' + col;
            //Add this move to the queue
            moves.push(letter + to_string(moveRow+1));
            if(board[moveRow][col].player != 0)
                search = 0;
        }
        else
            search = 0;
    }

    search = 1;
    while(search){
        //Search for moves going left
        moveCol--;
        //If the piece is on the board, is not owned by a friendly piece and will not put the king in check
        if(moveCol >= 0 && board[row][moveCol].player != player && !checkKing(board, row, col, row, moveCol, player)){
            letter = 'a' + moveCol;
            //Add this move to the queue
            moves.push(letter + to_string(row+1));
            if(board[row][moveCol].player != 0)
                search = 0;
        }
        else
            search = 0;
    }

    search = 1;
    moveCol = col;
    while(search){
        //Search for moves going right
        moveCol++;
        //If the piece is on the board, is not owned by a friendly piece and will not put the king in check
        if(moveCol < 8 && board[row][moveCol].player != player && !checkKing(board, row, col, row, moveCol, player)){
            letter = 'a' + moveCol;
            //Add this move to the queue
            moves.push(letter + to_string(row+1));
            if(board[row][moveCol].player != 0)
                search = 0;
        }
        else
            search = 0;
    }
}

void queenChoices(Piece** board, queue<string> &moves, int row, int col, int player){
    //The queen only makes moves derived from the bishop and rook so we add both to our options
    rookChoices(board, moves, row, col, player);
    bishopChoices(board, moves, row, col, player);
}

int validPiece(Piece **board, string str, int turn){
    //Check that the input contains a proper col
    if(str[0] < 'a' || str[0] > 'h')
        return 0;
    //Check that the input contains a proper row
    if(str[1] > '8' || str[1] < '1')
        return 0;
    
    //Convert input to row and col
    int row = str[1] - '0' - 1;
    int col = str[0] - 'a';
    
    //Check that this piece belongs to the player otherwise return 0
    if(board[row][col].player == turn)
        return 1;
    else
        return 0;
}

void moveCastle(Piece **board, string str, int player){
    
    //Castle for player 1
    if(player == 1){
        //If the user wants to long castle
        if(str == "castleLong"){
            //Set the king and rook position to empty spaces
            for(int i = 0; i <= 4; i+=4){
                board[7][i].player = 0;
                board[7][i].name = "empty";
                board[7][i].moves = 0;
            }
            
            //Assign the spots on the board to the king and rook after the castle
            board[7][2].player = player;
            board[7][2].name = "king";
            board[7][2].moves = 1;
            board[7][3].player = player;
            board[7][3].name = "rook";
            board[7][3].moves = 1;
        }
        //If the user wants to short castle
        else if(str == "castleShort"){
            //Set the king and rook position to empty spaces
            for(int i = 4; i <= 7; i+=3){
                board[7][i].player = 0;
                board[7][i].name = "empty";
                board[7][i].moves = 0;
            }
            
            //Assign the spots on the board to the king and rook after the castle
            board[7][6].player = player;
            board[7][6].name = "king";
            board[7][6].moves = 1;
            board[7][5].player = player;
            board[7][5].name = "rook";
            board[7][5].moves = 1;
        }
    }
    //Castle for player 2
    else if(player == 2){
        //If the user wants to long castle
        if(str == "castleLong"){
            //Set the king and rook position to empty spaces
            for(int i = 0; i <= 4; i+=4){
                board[0][i].player = 0;
                board[0][i].name = "empty";
                board[0][i].moves = 0;
            }
            
            //Assign the spots on the board to the king and rook after the castle
            board[0][2].player = player;
            board[0][2].name = "king";
            board[0][2].moves = 1;
            board[0][3].player = player;
            board[0][3].name = "rook";
            board[0][3].moves = 1;
        }
        //If the user wants to short castle
        else if(str == "castleShort"){
            //Set the king and rook position to empty spaces
            for(int i = 4; i <= 7; i+=3){
                board[0][i].player = 0;
                board[0][i].name = "empty";
                board[0][i].moves = 0;
            }
            
            //Assign the spots on the board to the king and rook after the castle
            board[0][6].player = player;
            board[0][6].name = "king";
            board[0][6].moves = 1;
            board[0][5].player = player;
            board[0][5].name = "rook";
            board[0][5].moves = 1;
        }
    }
}

void movePiece(Piece **board, string input, string moveTo, int player, unordered_map<string, int>& map){
    //Change chosen piece's position to row and col
    int row = input[1] - '0' - 1;
    int col = input[0] - 'a';
    //Change chosen move to row and col
    int moveRow = moveTo[1] - '0' - 1;
    int moveCol = moveTo[0] - 'a';
    
    //The piece type that is being moved
    string pieceType = board[row][col].name;
    
    
    //If the piece is a pawn, we must deal with en passant
    if(pieceType == "pawn"){
        //If it moved a distance of two, it can be captured via en passant
        if(abs(row-moveRow) == 2)
            board[moveRow][moveCol].en_passant = 1;
        
        //If a pawn moves diagonally
        if(abs(row-moveRow) == 1 && abs(col-moveCol) == 1){
            //If the move made diagonally was not occupied by an enemy
            //The we must have captured an enemy via en passant
            if(board[moveRow][moveCol].player == 0){
                if(player == 1){
                    //Remove the captured piece
                    board[moveRow+1][moveCol].name = "empty";
                    board[moveRow+1][moveCol].player = 0;
                    board[moveRow+1][moveCol].moves = 0;
                    //Add to list of captured pieces
                    map["pawn"]++;
                }
                if(player == 2){
                    //Remove the captured piece
                    board[moveRow-1][moveCol].name = "empty";
                    board[moveRow-1][moveCol].player = 0;
                    board[moveRow-1][moveCol].moves = 0;
                    //Add to list of captured pieces
                    map["pawn"]++;
                }
            }
        }
    }
    
    //Move the piece
    //Set the destination to equal to values of the moved piece
    board[moveRow][moveCol].name = board[row][col].name;
    board[moveRow][moveCol].player = board[row][col].player;
    board[moveRow][moveCol].moves = max(board[moveRow][moveCol].moves, board[moveRow][moveCol].moves + 1);

    //Set the original location of the piece to be an unoccupied square
    board[row][col].name = "empty";
    board[row][col].player = 0;
    board[row][col].moves = 0;
}


Piece** inilBoard(){
    
    //Create the board and make the beginning state of the game
    Piece** board = new Piece*[8];
    for(int i = 0; i < 8; i++){
        board[i] = new Piece[8];
    }
    
    //Set all positions to empty
    for(int i = 0; i < 8; i++){
        for(int j = 0; j < 8; j++){
            board[i][j].name = "empty";
            board[i][j].player = 0;
            board[i][j].moves = 0;
            board[i][j].en_passant = 0;
        }
    }
    
    //Setting all the pawns for player 2
    for(int i = 0; i < 2; i++){
        for(int j = 0; j < 8; j++){
            board[i][j].player = 2;
            if(i == 1)
                board[i][j].name = "pawn";
        }
    }

    //Setting all the pawns for player 1
    for(int i = 0; i < 2; i++){
        for(int j = 0; j < 8; j++){
            board[7-i][j].player = 1;
            if(i == 1)
                board[7-i][j].name = "pawn";
        }
    }
    
    //Begin represents the left side of the board
    //End represents the right
    int begin = 0, end = 7;
    
    string names[3] = {"rook", "knight", "bishop"};
    //Set the rook, bishop, and knight for each player
    for(int i = 0; i < 3; i++){
        board[begin][end-i].name = names[i];
        board[begin][begin+i].name = names[i];
        board[end][begin+i].name = names[i];
        board[end][end-i].name = names[i];
    }
    
    //Finally place the king and queen
    board[7][3].name = "queen", board[0][3].name = "queen";
    board[0][4].name = "king", board[7][4].name = "king";
    
    return board;
}

void output(Piece **board){
    
    //Output the game state
    cout<<endl;
    
    for(int i = 0; i < 8; i++){
        //Just some formatting
        cout<<i+1<<" |";
        for(int j = 0; j < 8; j++){
            
            string tile;    //Short letter to represent the type of piece on the board
            tile += to_string(board[i][j].player);  //Append the player it belongs to
            
            //Append P if the piece is a pawn
            if(board[i][j].name == "pawn")
                tile += "P";
            
            //Append R if the piece is a rook
            else if(board[i][j].name == "rook")
                tile += "R";
            
            //Append K if the piece is the king
            else if(board[i][j].name == "king")
                tile += "K";
            
            //Append Q if the piece is a queen
            else if(board[i][j].name == "queen")
                tile += "Q";
            
            //Append Kn if the piece is a knight
            else if(board[i][j].name == "knight")
                tile += "Kn";
            
            //Append B if the piece is a bishop
            else if(board[i][j].name == "bishop")
                tile += "B";
            
            cout<<setw(5)<<right<<tile;
        }
        cout<<endl;
        cout<<"  |";
        if(i !=7)
            cout<<endl;
    }
    cout<<"   ______________________________________"<<endl;
    cout<<"   ";
    
    char col = 'a';
    
    for(int i = 0; i < 8; i++, col++){
        cout<<setw(5)<<right<<col;
    }
    cout<<endl<<endl;
    
}