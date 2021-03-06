//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "hardhat/console.sol";

contract Token is Ownable, ERC20Capped, ERC20Burnable {
    /**
     * @param name Name of the token
     * @param symbol A symbol to be used as ticker
     * @param cap Maximum number of tokens mintable
     * @param initialSupply Initial token supply
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 cap,
        uint256 initialSupply
    ) ERC20(name, symbol) ERC20Capped(cap * (10**18)) {
        _mint(owner(), initialSupply * (10**18));
    }

    /**
     * @dev Creates `amount` new tokens for `to`.
     *
     * See {ERC20-_mint}.
     */
    function mint(address to, uint256 amount) public virtual onlyOwner {
        _mint(to, amount * (10**18));
    }

    function _mint(address to, uint256 amount)
        internal
        virtual
        override(ERC20, ERC20Capped)
    {
        super._mint(to, amount);
    }
}
