/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * File:   Piece.h
 * Author: Void
 *
 * Created on April 22, 2020, 2:53 PM
 */
#include <iostream>
using namespace std;

#ifndef PIECE_H
#define PIECE_H

struct Piece{
    string name;        //The name of the piece
    int player;         //Says what player the piece belongs to
    int moves;          //Keep track of how many times a piece has moved, useful for castling
    bool en_passant;    //Marks if a pawn can be captured by en passant
};

#endif /* PIECE_H */

